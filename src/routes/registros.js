/**
 * ============================================
 * src/routes/registros.js
 * ============================================
 * Rutas relacionadas con el ingreso/salida de operarios.
 */

const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

router.get('/config-planta/:planta', registroController.getConfigPlanta);
router.post('/registro', registroController.crearRegistro);
router.get('/registros', registroController.getRegistros);
router.delete('/registros-rango', registroController.deleteRegistrosRango);

module.exports = router;
