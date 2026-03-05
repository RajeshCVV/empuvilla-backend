/**
 * ============================================
 * src/config/constants.js
 * ============================================
 * Configuraciones globales, como las coordenadas de las plantas.
 */

require('dotenv').config();

const PLANTAS_CONFIG = {
    PTAP: {
        lat: parseFloat(process.env.PTAP_LAT || '3.17253'),
        lng: parseFloat(process.env.PTAP_LNG || '-76.4588'),
        radio: parseFloat(process.env.PTAP_RADIO || '35'),
    },
    PTAR: {
        lat: parseFloat(process.env.PTAR_LAT || '3.17300'),
        lng: parseFloat(process.env.PTAR_LNG || '-76.4600'),
        radio: parseFloat(process.env.PTAR_RADIO || '50'),
    }
};

module.exports = {
    PLANTAS_CONFIG
};
