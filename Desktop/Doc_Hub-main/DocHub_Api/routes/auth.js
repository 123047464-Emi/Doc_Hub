const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const { demoUsers } = require("../db/seedUsers");
const { registrarTrazabilidad } = require("../services/auditoria");
const auth = require("../middleware/auth");
const apiKey = require("../middleware/apiKey");
const { getRolePermissions } = require("../services/permisos");
const { requirePermission } = require("../middleware/permissions");

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await db.get(
      "SELECT id, username, password_hash, categoria, nombre, cargo FROM usuarios WHERE username = ?",
      [username]
    );

    if (!user) {
      return res.status(401).json({ message: "Usuario incorrecto" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Password incorrecto" });
    }

    const token = jwt.sign(
      { id: user.id, categoria: user.categoria },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await registrarTrazabilidad(req, {
      usuario: user,
      accion: "login",
      entidadTipo: "usuario",
      entidadId: user.id,
      metadata: { username: user.username },
    });

    res.json({
      token,
      usuario: {
        id: user.id,
        username: user.username,
        categoria: user.categoria,
        nombre: user.nombre,
        cargo: user.cargo,
        permisos: getRolePermissions(user.categoria),
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     categoria:
 *                       type: string
 *                       example: "Administrador"
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     cargo:
 *                       type: string
 *                       example: "Administrador del sistema"
 *                     permisos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - usuarios.leer
 *                         - documentos.crear
 *       401:
 *         description: Usuario no autenticado
 */

router.get("/me", apiKey, auth, requirePermission("auth.me"), (req, res) => {
  res.json({
    usuario: {
      id: req.user.id,
      username: req.user.username,
      categoria: req.user.categoria,
      nombre: req.user.nombre,
      cargo: req.user.cargo,
      permisos: getRolePermissions(req.user.categoria),
    },
  });
});


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesion cerrada"
 *       401:
 *         description: Usuario no autenticado
 */
router.post("/logout", apiKey, auth, requirePermission("auth.logout"), async (req, res, next) => {
  try {
    await registrarTrazabilidad(req, {
      accion: "logout",
      entidadTipo: "usuario",
      entidadId: req.user.id,
      metadata: { username: req.user.username },
    });

    res.json({ message: "Sesion cerrada" });
  } catch (err) {
    next(err);
  }
});

router.get("/demo-users", async (_req, res, next) => {
  try {
    const users = await db.all("SELECT id, username, categoria, nombre, cargo FROM usuarios ORDER BY id ASC");
    res.json(
      users.map((user) => ({
        username: user.username,
        password: "1234",
        categoria: user.categoria,
        nombre: user.nombre || user.username,
        cargo: user.cargo || user.categoria,
        permisos: getRolePermissions(user.categoria),
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
