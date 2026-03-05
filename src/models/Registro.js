/**
 * ============================================
 * src/models/Registro.js - Modelo de Mongoose
 * ============================================
 *
 * Schema de Registro de Ingreso/Salida.
 *
 * Cada registro representa un evento de ingreso o salida de un operario
 * en una planta específica. Incluye coordenadas GPS para validar
 * que el operario esté dentro de la geocerca.
 */

const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
    nombreOperario: { type: String, required: true },
    planta: { type: String, enum: ['PTAP', 'PTAR'], required: true },
    tipo: { type: String, enum: ['ingreso', 'salida'], required: true },
    lat: Number,
    lng: Number,
    dentroZona: Boolean,
    creadoEn: { type: Date, default: Date.now },
    fechaDia: { type: String },
    distancia: { type: String },
    justificacionExtra: { type: String },
    turno: { type: String },
});

module.exports = mongoose.model('Registro', registroSchema);
