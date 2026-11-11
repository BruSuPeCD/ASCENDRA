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

// Memoria volátil para almacenar los registros del día antes del cierre
const memoriaDiaActual = {};


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

/**
 * Lee el array de hábitos del estado local y construye dinámicamente
 * las tarjetas HTML correspondientes en el DOM.
 */
function renderizarHabitos() {
  // 1. Cargar el estado actual desde LocalStorage
  const datos = leerDatos();
  const catalogoHabitos = datos.habits;

  // 2. Localizar el contenedor principal y el botón de cierre en el HTML
  const contenedor = document.getElementById('habits-container');
  const botonCerrar = document.getElementById('btn-close-day');

  // 3. Limpiar las tarjetas antiguas de la pantalla sin borrar el botón
  const tarjetasAntiguas = contenedor.querySelectorAll('.habit-card');
  tarjetasAntiguas.forEach(tarjeta => tarjeta.remove());

  // 4. Bucle: Por cada hábito en el JSON, construir su representación visual
  catalogoHabitos.forEach(habito => {
    // 4a. Crear la tarjeta contenedora <article>
    const article = document.createElement('article');
    article.className = 'habit-card';

    // 4b. Crear la etiqueta descriptiva <label>
    const label = document.createElement('label');
    label.htmlFor = habito.id;
    label.className = 'habit-name';
    // Muestra el nombre y los puntos absolutos asignados en la configuración
    label.textContent = `${habito.name} (${habito.base_xp > 0 ? '+' : ''}${habito.base_xp} XP)`;

    // 4c. Crear el control interactivo <input>
    const input = document.createElement('input');
    input.id = habito.id; // Vincula el input con el label mediante el ID único

    // 4d. Configurar el tipo de input basándose en el esquema JSON
    if (habito.type === 'quantifiable') {
      input.type = 'number';
      input.className = 'habit-input-number';
      input.min = '0';
      input.placeholder = '0';
    } else {
      input.type = 'checkbox';
      input.className = 'habit-input-check';
    }

    // Asignar Event Listener para capturar la interacción del usuario
    input.addEventListener('change', (evento) => {
      const elementoInteractuado = evento.target;
      const idHabito = elementoInteractuado.id;
      let valorRegistrado;

      // Evaluar el tipo de input basándose en las restricciones del MVP
      if (elementoInteractuado.type === 'checkbox') {
        valorRegistrado = elementoInteractuado.checked ? 1 : 0;
      } else {
        valorRegistrado = parseFloat(elementoInteractuado.value) || 0;
      }

      // Guardar el valor en la memoria temporal del día
      memoriaDiaActual[idHabito] = valorRegistrado;
    });

    // 4e. Ensamblar las piezas dentro de la tarjeta
    article.appendChild(label);
    article.appendChild(input);

    // 4f. Inyectar la tarjeta completa en la pantalla, justo antes del botón "Cerrar Día"
    contenedor.insertBefore(article, botonCerrar);
  });
}

/**
 * Lee el estado del usuario del JSON y actualiza los medidores de Nivel y Forma en la cabecera.
 */
function renderizarMetricas() {
  // 1. Cargar el estado actual desde LocalStorage
  const datos = leerDatos();
  const estadoUsuario = datos.user_state;
  
  // 2. Extraer el valor del Nivel (historical_xp)
  const nivel = estadoUsuario.historical_xp;

  // 3. Localizar el elemento HTML del Nivel mediante su ID e inyectar el valor
  const elementoNivel = document.getElementById('level-value');
  elementoNivel.textContent = nivel;
  
  // 4. (Opcional por ahora) Preparar el elemento de Forma para el futuro
  const elementoForma = document.getElementById('form-value');
  elementoForma.textContent = "--"; // Se calculará dinámicamente en la Fase 5
}


// Renderizado inicial al cargar la aplicación
renderizarMetricas();
renderizarHabitos();


/**
 * Consolida la memoria volátil, evalúa la inacción (hábitos omitidos) 
 * y calcula la XP de cada registro aplicando las fórmulas matemáticas.
 */
function cerrarDia() {
  // 1. Cargar el estado actual desde LocalStorage
  const datos = leerDatos();
  const fechaHoy = new Date().toISOString().split("T")[0];

  // 2. Cruzar el catálogo maestro de hábitos con la memoria volátil
  const registrosDelDia = datos.habits.map((habito) => {
    // Si el hábito no existe en la memoria transitoria, forzamos un 0 absoluto (inacción)
    const valorRegistrado = memoriaDiaActual[habito.id] !== undefined ? memoriaDiaActual[habito.id] : 0;
    let xpCalculada = 0;

    // 3. Motor Matemático: Bifurcación del cálculo de XP según tipo y polaridad
    if (habito.type === 'quantifiable' && habito.polarity === 'positive') {
      // Proporcional con tope anti-farmeo
      const proporcion = valorRegistrado / habito.target;
      const multiplicadorFinal = Math.min(proporcion, habito.cap_multiplier);
      xpCalculada = multiplicadorFinal * habito.base_xp;
      
    } else if (habito.type === 'quantifiable' && habito.polarity === 'negative') {
      // Desliz explícito negativo (el base_xp ya es negativo, ej: -1)
      xpCalculada = valorRegistrado * habito.base_xp;
      
    } else {
      // Hábitos tipo 'check' (1 = cumplido, 0 = inacción o fallo)
      xpCalculada = valorRegistrado * habito.base_xp;
    }

    // 4. Devolver el registro empaquetado para este hábito
    return {
      habit_id: habito.id,
      value_recorded: valorRegistrado,
      xp_awarded: Math.round(xpCalculada) // Redondeo de seguridad para decimales
    };
  });

  // 5. Construir el objeto de registro diario
  const nuevoLogDiario = {
    id: generarUUID(),
    local_date: fechaHoy,
    is_closed: true,
    daily_xp_generated: 0, // Valor provisional; se calculará en la Fase 5
    records: registrosDelDia
  };

  // 6. Persistir en la base de datos
  datos.daily_logs.push(nuevoLogDiario);
  guardarDatos(datos);

  // 7. Vaciar la memoria volátil
  for (const clave in memoriaDiaActual) {
    delete memoriaDiaActual[clave];
  }
}

// Asignar el escuchador de eventos de clic al botón de cierre
document.getElementById('btn-close-day').addEventListener('click', cerrarDia);