/**
 * ============================================
 * src/routes/permisos.js
 * ============================================
 * Rutas relacionadas con los permisos.
 */

const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');

router.post('/', permisoController.crearPermiso);
router.get('/', permisoController.getPermisos);
router.delete('/:id', permisoController.eliminarPermiso);

module.exports = router;
