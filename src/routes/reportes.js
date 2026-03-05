/**
 * ============================================
 * src/routes/reportes.js
 * ============================================
 * Rutas relacionadas con la generación de reportes.
 */

const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/', reporteController.getReporteHoras);

module.exports = router;
