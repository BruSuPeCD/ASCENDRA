# HOJA DE RUTA DE DESARROLLO: ASCENDRA (MVP)

**Instrucciones para el LLM:**
Este documento define la secuencia estricta de desarrollo. Identifica el primer paso que no esté marcado con una `[x]` y enfoca tu respuesta técnica **únicamente** en resolver ese paso. No adelantes código de fases posteriores.

## FASE 0: Validación y Arquitectura (Actual)
- [x] 0.1. Definir reglas matemáticas estrictas (Topes, Modelo Dual, Nivel vs Forma).
- [x] 0.2. Diseñar el esquema de base de datos JSON (UUID, Inmutabilidad, Cierre de día).
- [ ] **0.3. Validación Manual:** Usar el sistema 14 días en hoja de cálculo para calibrar la motivación de los puntos y pesos. *(Bloqueante para programar la Fase 4, pero permite avanzar en Fase 1 y 2 en paralelo).*

## FASE 1: Esqueleto Estático (HTML y CSS)
*Objetivo: Construir la "carcasa" visual de la aplicación. En esta fase los botones no hacen nada.*
- [x] 1.1. Crear estructura de carpetas y archivos base (`index.html`, `style.css`, `app.js`).
- [x] 1.2. Programar el HTML estático de la cabecera (Métricas de Nivel, Forma y Botón Exportar).
- [x] 1.3. Programar el HTML estático de la lista de hábitos (Checkboxes, inputs numéricos).
- [x] 1.4. Programar el HTML del botón "Cerrar Día".
- [x] 1.5. Dar estilo a la interfaz con CSS (Diseño claro, minimalista, modo claro).

## FASE 2: Cimientos de Datos (JavaScript Base)
*Objetivo: Preparar la memoria del navegador y asegurar que los datos no se pierdan.*
- [x] 2.1. Programar función para generar un estado inicial vacío basado en el esquema JSON maestro.
- [x] 2.2. Programar funciones utilitarias de LocalStorage (`guardarDatos()`, `leerDatos()`).
- [x] 2.3. Programar función pura para generar UUIDs únicos.
- [x] 2.4. Implementar la funcionalidad del botón "Exportar a JSON" (Descargar archivo).
- [x] 2.5. Implementar la funcionalidad del botón "Importar desde JSON" (Restaurar copia de seguridad).

## FASE 3: Conexión UI-Datos (Renderizado)
*Objetivo: Que el HTML se dibuje automáticamente leyendo los datos del JSON, no con texto escrito a mano.*
- [x] 3.1. Borrar los hábitos estáticos del HTML.
- [x] 3.2. Programar función en JS que lea el array `habits` del JSON y construya dinámicamente el HTML de cada hábito según su tipo (check o cuantificable).
- [x] 3.3. Mostrar correctamente los valores de Nivel Histórico leyendo del JSON.

## FASE 4: El Motor de Interacción Diario
*Objetivo: Dar vida a los botones y aplicar las matemáticas.*
- [x] 4.1. Programar eventos de clic en los hábitos (marcar check, introducir número). Esto debe guardar el valor temporalmente en la memoria del día actual.
- [ ] 4.2. Implementar la lógica del botón "Cerrar Día": Cambiar el estado `is_closed` a `true`.
- [ ] 4.3. Motor Matemático: Al cerrar el día, calcular la XP de cada registro aplicando los topes (ej. `Math.min(..., 1.5)`).
- [ ] 4.4. Congelar la `xp_awarded` en el array `daily_logs` y guardar en LocalStorage.

## FASE 5: Progresión y Estadísticas Básicas
*Objetivo: Calcular el impacto de las acciones y reflejarlo en los medidores.*
- [ ] 5.1. Calcular nuevo Nivel: Sumar toda la XP positiva generada hoy al `historical_xp`.
- [ ] 5.2. Calcular Forma: Crear función que recorra los últimos 7 días con `is_closed: true` y calcule la media móvil del `daily_xp_generated`.
- [ ] 5.3. Actualizar la cabecera del DOM (HTML) con los nuevos cálculos tras cerrar el día.
- [ ] 5.4. Lógica de "Cambio de día": Detectar cuándo la hora local supera la `cutoff_time` (ej. 04:00 AM) para limpiar la pantalla y empezar un nuevo registro diario.

## FASE 6: Refinamiento del MVP
*Objetivo: Pulir la experiencia de uso antes de dar el proyecto por cerrado.*
- [ ] 6.1. Implementar estado visual de "Día ya cerrado" (Bloquear inputs para evitar trampas o ediciones posteriores).
- [ ] 6.2. Asegurar adaptabilidad móvil (Responsive design) en el CSS.
- [ ] 6.3. Testing general de usuario (Buscar bugs y casos límite).