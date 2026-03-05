/**
 * ============================================
 * src/config/db.js - Conexión a MongoDB
 * ============================================
 * Configura y exporta la función para conectar a la base de datos de MongoDB.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('La variable MONGODB_URI no está definida en el archivo .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas exitosamente');
    } catch (err) {
        console.error('❌ Error crítico al conectar a MongoDB:', err.message);
        process.exit(1); // Detener la aplicación si no hay base de datos
    }
};

module.exports = connectDB;
