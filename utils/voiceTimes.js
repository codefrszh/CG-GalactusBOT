// src/utils/voiceTimes.js
/**
 * Este módulo mantiene un registro simple en memoria
 * de los tiempos en voz de cada usuario.
 * 
 * Estructura:
 * {
 *   joinedAt: timestamp cuando entró,
 *   total: segundos acumulados
 * }
 */
const voiceTimes = new Map();

module.exports = voiceTimes;
