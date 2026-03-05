/**
 * ============================================
 * src/controllers/registroController.js
 * ============================================
 * Maneja la lógica de negocio para los registros de ingreso/salida.
 */

const Registro = require('../models/Registro');
const { PLANTAS_CONFIG } = require('../config/constants');
const { distanciaMetros } = require('../utils/geo');
const { obtenerFechaDia, determinarTurno } = require('../utils/time');

const getConfigPlanta = (req, res) => {
    const { planta } = req.params;
    const config = PLANTAS_CONFIG[planta];

    if (!config) {
        return res.status(404).json({ mensaje: 'Planta no encontrada' });
    }

    res.json(config);
};

const crearRegistro = async (req, res) => {
    try {
        const { nombreOperario, planta, tipo, lat, lng, justificacionExtra } = req.body;

        if (!nombreOperario || !planta || !tipo) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        if (!['PTAP', 'PTAR'].includes(planta)) {
            return res.status(400).json({ mensaje: 'Planta inválida' });
        }

        if (lat == null || lng == null) {
            return res.status(400).json({ mensaje: 'Se requiere ubicación GPS' });
        }

        const ahora = new Date();
        const horaLocalColombia = (ahora.getUTCHours() + 24 - 5) % 24;
        const fechaDia = obtenerFechaDia(ahora);

        const yaExiste = await Registro.findOne({ nombreOperario, planta, tipo, fechaDia });
        if (yaExiste) {
            return res.status(400).json({ mensaje: `Ya registraste un ${tipo} hoy para ${planta}` });
        }

        const config = PLANTAS_CONFIG[planta];
        const distancia = distanciaMetros(lat, lng, config.lat, config.lng);
        const dentroZona = distancia <= config.radio;

        if (!dentroZona) {
            return res.status(403).json({
                mensaje: `No estás en la zona de ${planta}. Distancia: ${distancia.toFixed(0)}m (máximo: ${config.radio}m)`,
                dentroZona: false,
                distancia: distancia.toFixed(0),
            });
        }

        if (planta === 'PTAP' && tipo === 'salida') {
            if (horaLocalColombia >= 17 && (!justificacionExtra || !justificacionExtra.trim())) {
                return res.status(400).json({ mensaje: 'Salida después de las 17:00 requiere justificación' });
            }
        }

        const turno = planta === 'PTAR' ? determinarTurno(ahora.getHours()) : null;

        const nuevoRegistro = new Registro({
            nombreOperario,
            planta,
            tipo,
            lat,
            lng,
            dentroZona,
            distancia: distancia.toFixed(0),
            fechaDia,
            justificacionExtra: justificacionExtra || undefined,
            turno,
        });

        await nuevoRegistro.save();

        res.json({
            mensaje: `Registro de ${tipo} guardado para ${planta}`,
            dentroZona,
            distancia: distancia.toFixed(0),
            turno,
            registro: nuevoRegistro,
        });
    } catch (error) {
        console.error('Error al guardar registro:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

const getRegistros = async (req, res) => {
    try {
        const { planta } = req.query;
        const filtro = planta ? { planta } : {};
        const registros = await Registro.find(filtro).sort({ creadoEn: -1 }).limit(100);
        res.json(registros);
    } catch (error) {
        console.error('Error al consultar registros:', error);
        res.status(500).json({ mensaje: 'Error al consultar registros' });
    }
};

const deleteRegistrosRango = async (req, res) => {
    try {
        const { operario, planta, desde, hasta } = req.body;

        if (!operario || !planta || !desde || !hasta) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const resultado = await Registro.deleteMany({
            nombreOperario: operario,
            planta,
            fechaDia: { $gte: desde, $lte: hasta },
        });

        res.json({ mensaje: 'Registros eliminados', eliminados: resultado.deletedCount });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
};

module.exports = {
    getConfigPlanta,
    crearRegistro,
    getRegistros,
    deleteRegistrosRango
};
