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


// Clave de identificación para los datos en el almacenamiento local
const STORAGE_KEY = "ascendra_data";

/**
 * Convierte el objeto de datos a texto y lo guarda en LocalStorage.
 * @param {Object} datos - Objeto de datos completo de la aplicación.
 */
function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}


/**
 * Lee los datos guardados en LocalStorage. Si no existen, invoca la plantilla inicial.
 * @returns {Object} Objeto de datos recuperado o plantilla base.
 */
function leerDatos() {
  const datosGuardados = localStorage.getItem(STORAGE_KEY);
  if (datosGuardados) {
    return JSON.parse(datosGuardados);
  }
  return generarEstadoInicial();
}

/**
 * Genera un UUID (Universally Unique Identifier) versión 4.
 * @returns {string} Cadena de texto con un identificador único universal.
 */
function generarUUID() {
  return crypto.randomUUID();
}

/**
 * Genera y descarga un archivo .json con la copia de seguridad de los datos actuales.
 */
function exportarDatos() {
  const datos = leerDatos();
  const datosString = JSON.stringify(datos, null, 2);
  const blob = new Blob([datosString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `ascendra_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}