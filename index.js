/**
 * ============================================
 * index.js - Backend del Sistema de Control de Operarios EMPUVILLA
 * ============================================
 *
 * Servidor Express.js que gestiona el registro de ingreso/salida
 * de operarios en las plantas PTAP y PTAR de EMPUVILLA.
 *
 * Arquitectura: MVC (Separación en Controllers, Routes, Models, Utils)
 * Base de datos: MongoDB Atlas (vía Mongoose)
 * Autor: Multivela Studio & Fotografía Rajesh
 * Versión: 2.1 - Reorganizado para Mayor Mantenibilidad
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

// Rutas
const rutasRegistros = require('./src/routes/registros');
const rutasPermisos = require('./src/routes/permisos');
const rutasReportes = require('./src/routes/reportes');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Conexión a la base de datos
connectDB();

// Configuración de Rutas de la API
// Usamos '/api' como prefijo o enrutamos directamente según como lo espera el frontend.
app.use('/api', rutasRegistros); // Tiene POST /registro, GET /registros, DELETE /registros-rango, GET /config-planta/:planta
app.use('/api/permisos', rutasPermisos);
app.use('/api/reporte-horas', rutasReportes);

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor EMPUVILLA escuchando en el puerto ${PORT}`);
});
