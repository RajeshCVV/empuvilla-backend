/**
 * ============================================
 * src/utils/time.js
 * ============================================
 * Funciones de utilidad para el manejo de tiempo y fechas.
 */

function obtenerFechaDia(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

function determinarTurno(hora) {
    if (hora >= 6 && hora < 14) return 'mañana';
    if (hora >= 14 && hora < 22) return 'tarde';
    return 'noche';
}

function obtenerSemana(fecha) {
    const dia = new Date(fecha);
    const diaSemana = dia.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana; // Ajustar para que lunes sea el inicio

    const inicioSemana = new Date(dia);
    inicioSemana.setDate(dia.getDate() + diff);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return { inicio: inicioSemana, fin: finSemana };
}

function aFechaColombia(date) {
    const OFFSET_COLOMBIA_MS = 5 * 60 * 60 * 1000; // 5 horas
    return new Date(date.getTime() - OFFSET_COLOMBIA_MS);
}

function horasEntre(fechaInicio, fechaFin) {
    const ms = fechaFin - fechaInicio;
    return ms > 0 ? ms / (1000 * 60 * 60) : 0;
}

function extraerIntervalos(registros) {
    const intervalos = [];
    let ultimoIngreso = null;

    for (const reg of registros) {
        if (reg.tipo === 'ingreso') {
            ultimoIngreso = reg.creadoEn;
        } else if (reg.tipo === 'salida' && ultimoIngreso) {
            intervalos.push({
                inicio: new Date(ultimoIngreso),
                fin: new Date(reg.creadoEn),
            });
            ultimoIngreso = null;
        }
    }

    return intervalos;
}

module.exports = {
    obtenerFechaDia,
    determinarTurno,
    obtenerSemana,
    aFechaColombia,
    horasEntre,
    extraerIntervalos
};
