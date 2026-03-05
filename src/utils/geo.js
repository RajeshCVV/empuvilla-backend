/**
 * ============================================
 * src/utils/geo.js
 * ============================================
 * Funciones de geolocalización.
 */

/**
 * Calcula la distancia en metros entre dos puntos geográficos
 * usando la fórmula de Haversine.
 *
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distancia en metros
 */
function distanciaMetros(lat1, lng1, lat2, lng2) {
    const RADIO_TIERRA = 6371000;
    const aRadianes = (grado) => (grado * Math.PI) / 180;

    const dLat = aRadianes(lat2 - lat1);
    const dLng = aRadianes(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return RADIO_TIERRA * c;
}

module.exports = {
    distanciaMetros
};
