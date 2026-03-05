/**
 * ============================================
 * src/controllers/permisoController.js
 * ============================================
 * Lógica para la gestión de permisos laborales.
 */

const Permiso = require('../models/Permiso');

const crearPermiso = async (req, res) => {
    try {
        const { nombreOperario, planta, fechaPermiso, horasPermiso, motivo } = req.body;

        if (!nombreOperario || !planta || !fechaPermiso || !horasPermiso || !motivo) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const nuevoPermiso = new Permiso({
            nombreOperario,
            planta,
            fechaPermiso,
            horasPermiso: parseFloat(horasPermiso),
            motivo,
        });

        await nuevoPermiso.save();

        res.json({
            mensaje: 'Permiso registrado',
            permiso: nuevoPermiso,
        });
    } catch (error) {
        console.error('Error al crear permiso:', error);
        res.status(500).json({ mensaje: 'Error al registrar permiso' });
    }
};

const getPermisos = async (req, res) => {
    try {
        const { operario, planta, desde, hasta } = req.query;

        if (!operario || !planta || !desde || !hasta) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const permisos = await Permiso.find({
            nombreOperario: operario,
            planta,
            fechaPermiso: { $gte: desde, $lte: hasta },
        }).sort({ fechaPermiso: 1 });

        res.json(permisos);
    } catch (error) {
        console.error('Error al listar permisos:', error);
        res.status(500).json({ mensaje: 'Error al listar permisos' });
    }
};

const eliminarPermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await Permiso.findByIdAndDelete(id);

        if (!resultado) {
            return res.status(404).json({ mensaje: 'Permiso no encontrado' });
        }

        res.json({ mensaje: 'Permiso eliminado' });
    } catch (error) {
        console.error('Error al eliminar permiso:', error);
        res.status(500).json({ mensaje: 'Error al eliminar permiso' });
    }
};

module.exports = {
    crearPermiso,
    getPermisos,
    eliminarPermiso
};
