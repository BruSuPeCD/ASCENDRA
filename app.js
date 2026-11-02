/**
 * Genera el estado inicial vacío de la base de datos de ASCENDRA.
 * @returns {Object} Estructura base del sistema según el esquema JSON maestro.
 */
function generarEstadoInicial() {
  return {
    app_config: {
      version: "0.1",
      cutoff_time: "04:00" 
    },
    user_state: {
      historical_xp: 0 
    },
    habits: [], 
    daily_logs: [] 
  };
}