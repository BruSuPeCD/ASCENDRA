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


/**
 * Solicita al usuario un archivo JSON, lee su contenido y restaura la base de datos local.
 */
function importarDatos() {
  // 1. Crear un input de archivo invisible en el DOM
  const inputArchivo = document.createElement('input');
  inputArchivo.type = 'file';
  inputArchivo.accept = '.json';

  // 2. Escuchar el evento cuando el usuario selecciona el archivo
  inputArchivo.addEventListener('change', function(evento) {
    const archivo = evento.target.files[0];
    
    // Si el usuario cancela la ventana de selección, detenemos la ejecución
    if (!archivo) {
      return; 
    }

    // 3. Instanciar FileReader para leer el documento físico
    const lector = new FileReader();
    
    // 4. Definir qué hacer cuando el archivo termine de leerse
    lector.onload = function(e) {
      try {
        // Desempaquetar el texto plano a un objeto JavaScript
        const datosImportados = JSON.parse(e.target.result);
        
        // 5. Validación estructural estricta
        if (!datosImportados.app_config || !datosImportados.user_state || !datosImportados.habits) {
          throw new Error("El archivo seleccionado no tiene el formato maestro de ASCENDRA.");
        }

        // 6. Sobrescribir la memoria y recargar
        guardarDatos(datosImportados);
        alert("Copia de seguridad restaurada con éxito. La aplicación se reiniciará.");
        location.reload(); 

      } catch (error) {
        console.error("Fallo de integridad:", error);
        alert("Error al importar: " + error.message);
      }
    };

    // 7. Ordenar al lector que procese el archivo como texto
    lector.readAsText(archivo);
  });

  // 8. Simular el clic del usuario para abrir el explorador de archivos
  inputArchivo.click();
}