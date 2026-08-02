const express = require("express");
const auth = require("../middleware/auth");
const apiKey = require("../middleware/apiKey");
const db = require("../db");
const { mapNotificacion } = require("../services/notificaciones");
const { registrarTrazabilidad } = require("../services/auditoria");
const { requirePermission } = require("../middleware/permissions");

const router = express.Router();

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtener notificaciones del usuario
 *     tags:
 *       - Notificaciones
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */

router.get("/", apiKey, auth, requirePermission("notificaciones.leer"), async (req, res, next) => {
  try {
    const notificaciones = await db.all(
      `SELECT n.*, u.nombre AS usuario_origen_nombre
       FROM notificaciones n
       LEFT JOIN usuarios u ON u.id = n.usuario_origen_id
       WHERE n.usuario_destino_id = ?
       ORDER BY n.creado_en DESC`,
      [req.user.id]
    );

    res.json(notificaciones.map(mapNotificacion));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /notificaciones/contador:
 *   get:
 *     summary: Obtener cantidad de notificaciones no leídas del usuario actual
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contador de notificaciones obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 noLeidas:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Usuario no autenticado
 */

router.get("/contador", apiKey, auth, requirePermission("notificaciones.leer"), async (req, res, next) => {
  try {
    const row = await db.get(
      "SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_destino_id = ? AND estado = ?",
      [req.user.id, "No leida"]
    );

    const total = Number(row?.total || 0);
    res.json({ total, noLeidas: total });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /notificaciones/{id}/leida:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 estado:
 *                   type: string
 *                   example: "Leida"
 *                 tipo:
 *                   type: string
 *                   example: "firma_pendiente"
 *       404:
 *         description: Notificación no encontrada
 *       401:
 *         description: Usuario no autenticado
 */

router.patch("/:id/leida", apiKey, auth, requirePermission("notificaciones.marcar_leida"), async (req, res, next) => {
  try {
    const notificacion = await db.get(
      "SELECT * FROM notificaciones WHERE id = ? AND usuario_destino_id = ?",
      [req.params.id, req.user.id]
    );

    if (!notificacion) {
      return res.status(404).json({ message: "Notificacion no encontrada" });
    }

    await db.run(
      "UPDATE notificaciones SET estado = ?, leido_en = CURRENT_TIMESTAMP WHERE id = ?",
      ["Leida", req.params.id]
    );

    await registrarTrazabilidad(req, {
      accion: "leer_notificacion",
      entidadTipo: "notificacion",
      entidadId: req.params.id,
      documentoId: notificacion.documento_id,
      expedienteId: notificacion.expediente_id,
      metadata: { tipo: notificacion.tipo, accion: notificacion.accion },
    });

    const actualizada = await db.get(
      `SELECT n.*, u.nombre AS usuario_origen_nombre
       FROM notificaciones n
       LEFT JOIN usuarios u ON u.id = n.usuario_origen_id
       WHERE n.id = ?`,
      [req.params.id]
    );

    res.json(mapNotificacion(actualizada));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
