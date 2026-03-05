/**
 * ============================================
 * src/controllers/reporteController.js
 * ============================================
 * Generación de reportes de horas (PTAP y PTAR).
 */

const Registro = require('../models/Registro');
const Permiso = require('../models/Permiso');
const { extraerIntervalos, obtenerFechaDia, aFechaColombia, obtenerSemana, horasEntre } = require('../utils/time');

const calcularHorasPTAP = (operario, desde, hasta, registros, totalHorasPermiso, res) => {
    const intervalos = extraerIntervalos(registros);

    function esDomingo(d) {
        return d.getDay() === 0;
    }

    let horasNormales = 0;
    let horasExtra = 0;
    let horasDominicales = 0;
    const detalle = [];

    for (const intervalo of intervalos) {
        let actual = new Date(intervalo.inicio);

        while (actual < intervalo.fin) {
            const inicioDia = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 0, 0, 0);
            const finDia = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 23, 59, 59);

            const inicioSegmento = new Date(Math.max(actual, inicioDia));
            const finSegmento = new Date(Math.min(intervalo.fin, finDia));

            const fechaTexto = obtenerFechaDia(inicioSegmento);
            const domingo = esDomingo(inicioSegmento);

            const bloqueManianaInicio = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate(), 12, 0, 0);
            const bloqueManianaFin = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate(), 17, 0, 0);

            const bloqueTardeInicio = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate(), 19, 0, 0);
            const bloqueTardeFin = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate(), 22, 0, 0);

            const bloqueExtraInicio = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate(), 22, 0, 0);

            function interseccion(inicioBloque, finBloque) {
                const ini = new Date(Math.max(inicioSegmento, inicioBloque));
                const fin = new Date(Math.min(finSegmento, finBloque));
                if (fin <= ini) return 0;
                return horasEntre(ini, fin);
            }

            const horasManiana = interseccion(bloqueManianaInicio, bloqueManianaFin);
            const horasTarde = interseccion(bloqueTardeInicio, bloqueTardeFin);
            const horasExtraDia = interseccion(bloqueExtraInicio, finDia);
            const horasNormalesDia = horasManiana + horasTarde;

            if (domingo) {
                horasDominicales += horasNormalesDia + horasExtraDia;
                detalle.push({
                    fecha: fechaTexto,
                    domingo: true,
                    horasNormalesDia,
                    horasExtraDia,
                    horasDominicalesDia: horasNormalesDia + horasExtraDia,
                    horasNocturnas: 0,
                });
            } else {
                horasNormales += horasNormalesDia;
                horasExtra += horasExtraDia;
                detalle.push({
                    fecha: fechaTexto,
                    domingo: false,
                    horasNormalesDia,
                    horasExtraDia,
                    horasDominicalesDia: 0,
                    horasNocturnas: 0,
                });
            }

            actual = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate() + 1, 0, 0, 0);
        }
    }

    const totalHoras = horasNormales + horasExtra + horasDominicales;

    res.json({
        operario,
        planta: 'PTAP',
        desde,
        hasta,
        totalHoras: Number(totalHoras.toFixed(2)),
        horasNormales: Number(horasNormales.toFixed(2)),
        horasExtra: Number(horasExtra.toFixed(2)),
        horasDominicales: Number(horasDominicales.toFixed(2)),
        horasNocturnas: 0,
        horasPermiso: Number(totalHorasPermiso.toFixed(2)),
        detalle,
    });
};

const calcularHorasPTAR = (operario, desde, hasta, registros, totalHorasPermiso, res) => {
    const intervalos = extraerIntervalos(registros);
    const semanas = {};
    const detalleDias = [];

    for (const intervalo of intervalos) {
        let actual = new Date(intervalo.inicio);

        while (actual < intervalo.fin) {
            const inicioDia = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 0, 0, 0);
            const finDia = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate(), 23, 59, 59);

            const inicioSegmento = new Date(Math.max(actual, inicioDia));
            const finSegmento = new Date(Math.min(intervalo.fin, finDia));

            const horasDelDia = (finSegmento - inicioSegmento) / (1000 * 60 * 60);

            const inicioLocal = aFechaColombia(inicioSegmento);
            const finLocal = aFechaColombia(finSegmento);

            const inicio19hLocal = new Date(inicioLocal.getFullYear(), inicioLocal.getMonth(), inicioLocal.getDate(), 19, 0, 0);
            const fin6hSiguienteLocal = new Date(inicioLocal.getFullYear(), inicioLocal.getMonth(), inicioLocal.getDate() + 1, 6, 0, 0);

            let horasNocturnas = 0;

            if (finLocal > inicio19hLocal && inicioLocal < fin6hSiguienteLocal) {
                const inicioNocturnoLocal = new Date(Math.max(inicioLocal, inicio19hLocal));
                const finNocturnoLocal = new Date(Math.min(finLocal, fin6hSiguienteLocal));
                horasNocturnas = Math.max(0, (finNocturnoLocal - inicioNocturnoLocal) / (1000 * 60 * 60));
            }

            const fechaTexto = obtenerFechaDia(inicioSegmento);
            const semana = obtenerSemana(inicioSegmento);
            const claveSemana = `${obtenerFechaDia(semana.inicio)}_${obtenerFechaDia(semana.fin)}`;

            if (!semanas[claveSemana]) {
                semanas[claveSemana] = {
                    inicio: obtenerFechaDia(semana.inicio),
                    fin: obtenerFechaDia(semana.fin),
                    horasTotales: 0,
                    horasNormales: 0,
                    horasExtra: 0,
                    horasNocturnas: 0,
                };
            }

            semanas[claveSemana].horasTotales += horasDelDia;
            semanas[claveSemana].horasNocturnas += horasNocturnas;

            detalleDias.push({
                fecha: fechaTexto,
                horas: horasDelDia,
                horasNocturnas,
                semana: claveSemana,
            });

            actual = new Date(inicioSegmento.getFullYear(), inicioSegmento.getMonth(), inicioSegmento.getDate() + 1, 0, 0, 0);
        }
    }

    for (const claveSemana in semanas) {
        const semana = semanas[claveSemana];
        if (semana.horasTotales <= 45) {
            semana.horasNormales = semana.horasTotales;
            semana.horasExtra = 0;
        } else {
            semana.horasNormales = 45;
            semana.horasExtra = semana.horasTotales - 45;
        }
    }

    const totalHoras = Object.values(semanas).reduce((sum, s) => sum + s.horasTotales, 0);
    const totalNormales = Object.values(semanas).reduce((sum, s) => sum + s.horasNormales, 0);
    const totalExtra = Object.values(semanas).reduce((sum, s) => sum + s.horasExtra, 0);
    const totalNocturnas = Object.values(semanas).reduce((sum, s) => sum + s.horasNocturnas, 0);

    res.json({
        operario,
        planta: 'PTAR',
        desde,
        hasta,
        totalHoras: Number(totalHoras.toFixed(2)),
        horasNormales: Number(totalNormales.toFixed(2)),
        horasExtra: Number(totalExtra.toFixed(2)),
        horasDominicales: 0,
        horasNocturnas: Number(totalNocturnas.toFixed(2)),
        horasPermiso: Number(totalHorasPermiso.toFixed(2)),
        detalleSemanas: Object.values(semanas),
        detalleDias,
    });
};

const getReporteHoras = async (req, res) => {
    try {
        const { operario, planta, desde, hasta } = req.query;

        if (!operario || !planta || !desde || !hasta) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const inicio = new Date(`${desde}T00:00:00`);
        const fin = new Date(`${hasta}T23:59:59`);

        const registros = await Registro.find({
            nombreOperario: operario,
            planta,
            creadoEn: { $gte: inicio, $lte: fin },
        }).sort({ creadoEn: 1 });

        const permisos = await Permiso.find({
            nombreOperario: operario,
            planta,
            fechaPermiso: { $gte: desde, $lte: hasta },
        });

        const totalHorasPermiso = permisos.reduce((sum, p) => sum + p.horasPermiso, 0);

        if (planta === 'PTAP') {
            return calcularHorasPTAP(operario, desde, hasta, registros, totalHorasPermiso, res);
        } else {
            return calcularHorasPTAR(operario, desde, hasta, registros, totalHorasPermiso, res);
        }
    } catch (error) {
        console.error('Error en reporte:', error);
        res.status(500).json({ mensaje: 'Error al generar reporte' });
    }
};

module.exports = {
    getReporteHoras
};
