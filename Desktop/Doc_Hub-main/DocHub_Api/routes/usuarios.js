const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const apiKey = require("../middleware/apiKey");
const { requirePermission } = require("../middleware/permissions");
const db = require("../db");
const { registrarTrazabilidad } = require("../services/auditoria");
const { getRolePermissions } = require("../services/permisos");

const router = express.Router();

function mapUsuario(user) {
  return {
    id: String(user.id),
    username: user.username,
    categoria: user.categoria,
    nombre: user.nombre,
    cargo: user.cargo,
    permisos: getRolePermissions(user.categoria),
  };
}

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *       401:
 *         description: No autorizado
 */

router.get("/me", apiKey, auth, requirePermission("usuarios.me.leer"), async (req, res, next) => {
  try {
    const user = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [req.user.id]
    );

    res.json(mapUsuario(user));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios registrados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */

router.get("/", apiKey, auth, requirePermission("usuarios.leer"), async (_req, res, next) => {
  try {
    const users = await db.all(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios ORDER BY categoria, nombre"
    );

    res.json(users.map(mapUsuario));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - categoria
 *               - nombre
 *             properties:
 *               username:
 *                 type: string
 *                 example: "jperez"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               categoria:
 *                 type: string
 *                 example: "Abogado"
 *               nombre:
 *                 type: string
 *                 example: "Juan Perez"
 *               cargo:
 *                 type: string
 *                 example: "Abogado Senior"
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Usuario ya existente
 */

router.post("/", apiKey, auth, requirePermission("usuarios.crear"), async (req, res, next) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "1234");
    const categoria = String(req.body.categoria || "").trim();
    const nombre = String(req.body.nombre || "").trim();
    const cargo = String(req.body.cargo || "").trim();

    if (!username || !categoria || !nombre) {
      return res.status(400).json({ message: "Usuario, categoria y nombre son obligatorios" });
    }

    if (!["Administrador", "Juez", "Notario", "Abogado", "Parte", "Testigo"].includes(categoria)) {
      return res.status(400).json({ message: "Categoria no valida" });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: "La contrasena debe tener al menos 4 caracteres" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO usuarios (username, password_hash, categoria, nombre, cargo) VALUES (?, ?, ?, ?, ?)",
      [username, hash, categoria, nombre, cargo || categoria]
    );

    const creado = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [result.id]
    );

    await registrarTrazabilidad(req, {
      accion: "crear_usuario",
      entidadTipo: "usuario",
      entidadId: creado.id,
      metadata: { username: creado.username, categoria: creado.categoria },
    });

    res.status(201).json(mapUsuario(creado));
  } catch (err) {
    if (String(err.message || "").includes("UNIQUE")) {
      return res.status(409).json({ message: "El nombre de usuario ya existe" });
    }
    next(err);
  }
});

router.delete("/:id", apiKey, auth, requirePermission("usuarios.crear"), async (req, res, next) => {
  try {
    const target = String(req.params.id);
    const existing = await db.get(
      "SELECT id, username FROM usuarios WHERE id = ? OR username = ?",
      [target, target]
    );

    if (!existing) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await db.run("DELETE FROM usuarios WHERE id = ?", [existing.id]);

    await registrarTrazabilidad(req, {
      accion: "eliminar_usuario",
      entidadTipo: "usuario",
      entidadId: existing.id,
      metadata: { username: existing.username },
    });

    res.json({ message: "Usuario eliminado correctamente", id: existing.id });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", apiKey, auth, requirePermission("usuarios.crear"), async (req, res, next) => {
  try {
    const target = String(req.params.id);
    const existing = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ? OR username = ?",
      [target, target]
    );

    if (!existing) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const nombre = req.body.nombre || req.body.name || existing.nombre;
    const categoria = req.body.categoria || req.body.role || existing.categoria;
    const cargo = req.body.cargo || existing.cargo;

    await db.run(
      "UPDATE usuarios SET nombre = ?, categoria = ?, cargo = ? WHERE id = ?",
      [nombre, categoria, cargo, existing.id]
    );

    const actualizado = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [existing.id]
    );

    await registrarTrazabilidad(req, {
      accion: "editar_usuario",
      entidadTipo: "usuario",
      entidadId: existing.id,
      metadata: { username: existing.username, anterior: existing, nuevo: actualizado },
    });

    res.json(mapUsuario(actualizado));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /usuarios/me:
 *   put:
 *     summary: Actualizar información del perfil del usuario actual
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - cargo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Maria Lopez"
 *               cargo:
 *                 type: string
 *                 example: "Juez"
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: No autorizado
 */

router.put("/me", apiKey, auth, requirePermission("usuarios.me.editar"), async (req, res, next) => {
  try {
    const nombre = String(req.body.nombre || "").trim();
    const cargo = String(req.body.cargo || "").trim();

    if (!nombre || !cargo) {
      return res.status(400).json({ message: "Nombre y cargo son obligatorios" });
    }

    const anterior = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [req.user.id]
    );

    await db.run(
      "UPDATE usuarios SET nombre = ?, cargo = ? WHERE id = ?",
      [nombre, cargo, req.user.id]
    );

    const actualizado = await db.get(
      "SELECT id, username, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [req.user.id]
    );

    req.user = actualizado;
    await registrarTrazabilidad(req, {
      accion: "cambio_perfil",
      entidadTipo: "usuario",
      entidadId: req.user.id,
      metadata: {
        anterior: { nombre: anterior.nombre, cargo: anterior.cargo },
        nuevo: { nombre: actualizado.nombre, cargo: actualizado.cargo },
      },
    });

    res.json(mapUsuario(actualizado));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /usuarios/me/password:
 *   put:
 *     summary: Cambiar contraseña del usuario actual
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordActual
 *               - passwordNueva
 *             properties:
 *               passwordActual:
 *                 type: string
 *                 example: "1234"
 *               passwordNueva:
 *                 type: string
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Contraseña inválida
 *       401:
 *         description: Contraseña actual incorrecta
 */

router.put("/me/password", apiKey, auth, requirePermission("usuarios.me.cambiar_password"), async (req, res, next) => {
  try {
    const passwordActual = String(req.body.passwordActual || "");
    const passwordNueva = String(req.body.passwordNueva || "");

    if (!passwordActual || passwordNueva.length < 4) {
      return res.status(400).json({ message: "La contrasena nueva debe tener al menos 4 caracteres" });
    }

    const user = await db.get(
      "SELECT id, username, password_hash, categoria, nombre, cargo FROM usuarios WHERE id = ?",
      [req.user.id]
    );
    const valid = await bcrypt.compare(passwordActual, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "La contrasena actual no es correcta" });
    }

    const hash = await bcrypt.hash(passwordNueva, 10);
    await db.run("UPDATE usuarios SET password_hash = ? WHERE id = ?", [hash, req.user.id]);

    await registrarTrazabilidad(req, {
      accion: "cambio_password",
      entidadTipo: "usuario",
      entidadId: req.user.id,
      metadata: { username: user.username },
    });

    res.json({ message: "Contrasena actualizada" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
