/**
 * ============================================
 * src/models/Permiso.js - Modelo de Mongoose
 * ============================================
 *
 * Schema de Permisos laborales.
 *
 * Cada permiso registra las horas de ausencia autorizada
 * de un operario en una fecha específica.
 */

const mongoose = require('mongoose');

const permisoSchema = new mongoose.Schema({
    nombreOperario: { type: String, required: true },
    planta: { type: String, enum: ['PTAP', 'PTAR'], required: true },
    fechaPermiso: { type: String, required: true },
    horasPermiso: { type: Number, required: true },
    motivo: { type: String, required: true },
    creadoEn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Permiso', permisoSchema);
