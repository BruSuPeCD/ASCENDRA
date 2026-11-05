**Última actualización:** 02 de Noviembre de 2026

**Contexto para el LLM:**
Este es el documento maestro del proyecto ASCENDRA ("Single Source of Truth"). Contiene las reglas arquitectónicas y matemáticas vigentes. Omite cualquier debate previo sobre opciones descartadas (como fórmulas de normalización, el descenso de nivel o los hábitos de tramos). Tu rol es aplicar estrictamente estas reglas en tus sugerencias técnicas y no sugerir enfoques que las contradigan.

#### 1. Definición del Producto (Fase Actual)
*   **Enfoque:** Proyecto personal de aprendizaje (MVP para un solo usuario). No hay backend complejo (Supabase) en esta fase inicial.
*   **Fase actual:** Validación Matemática y Cimientos de Datos (Fase 4). El código gráfico (UI) está congelado. El usuario está validando el sistema de puntuación manualmente en una hoja de cálculo. En paralelo, se está diseñando la capa lógica de persistencia.
*   **Restricciones de alcance:** El MVP solo incluye hábitos tipo *check* y *cuantificables* (proporcionales). Los hábitos por umbrales quedan descartados por su alta carga cognitiva.

#### 2. Motor Lógico y Reglas de XP
El sistema de progresión y puntuación obedece a estas fórmulas matemáticas estrictas:
*   **Puntos fijos:** Los comportamientos tienen valores absolutos (ej. +100, -50). No existe normalización por capacidad.
*   **Modelo Dual para Abstinencias:** Para evitar premiar la inacción (donde no registrar un fallo sale gratis), las abstinencias se modelan obligatoriamente con dos hábitos emparejados:
    *   Positivo (Check): "Día limpio" (ej. +30 XP). Se gana por inacción, se pierde si se recae.
    *   Negativo (Cuantificable): El "Desliz" explícito (ej. -1 XP/min o unidad). Solo se anota si se falla el check.
*   **Topes Anti-farmeo:** En los hábitos cuantificables positivos, la XP máxima generada se capa a un multiplicador estricto (ej. 1.5x del objetivo base) mediante la lógica `Math.min(realizado/objetivo, 1.5)`.
*   **Medidores Separados:** El castigo por recaídas no destruye el progreso histórico.
    *   `Nivel` (Histórico): Suma acumulativa irreversible que solo registra la XP positiva generada. Nunca baja.
    *   `Forma` (Móvil): Promedio de los últimos 7 a 30 días de la "XP neta" (positivos y negativos juntos). Absorbe el impacto de las recaídas.

#### 3. Estructura de Datos (JSON / Persistencia)
La aplicación guardará el estado en el navegador (LocalStorage) pero requerirá un sistema de exportación/importación en formato JSON desde el día 1 para evitar la purga de datos del navegador. La estructura de la base de datos local obedece a este esquema exacto:

```json
{
  "app_config": {
    "version": "0.1",
    "cutoff_time": "04:00"
  },
  "user_state": {
    "historical_xp": 1850
  },
  "habits": [
    {
      "id": "uuid-v4",
      "name": "Lectura",
      "type": "quantifiable",
      "polarity": "positive",
      "base_xp": 100,
      "target": 20,
      "cap_multiplier": 1.5,
      "schedule_days": [1, 2, 3, 4, 5, 6, 7],
      "status": "active"
    }
  ],
  "daily_logs": [
    {
      "id": "uuid-v4",
      "local_date": "YYYY-MM-DD",
      "is_closed": true,
      "daily_xp_generated": 250,
      "records": [
        {
          "habit_id": "uuid-v4",
          "value_recorded": 30,
          "xp_awarded": 150
        }
      ]
    }
  ]
}
```
*   **Regla de inmutabilidad:** Los cambios en la configuración de `habits` no alteran el historial. `daily_logs` guarda la `xp_awarded` congelada en el momento del registro.
*   **Hora de corte:** Aislar la fecha del sistema (`local_date`) mediante el `cutoff_time` para que los registros de madrugada se asignen al día lógico correcto.
*   **Cierre de día:** Un día sin registros (nulo) se ignora en la media móvil. Un día debe cerrarse explícitamente (`is_closed: true`) para que los valores de inacción (como fallar todos los checks) se consoliden.



Mecanismos de persistencia y exportación en cliente: La clave única utilizada en LocalStorage queda fijada como "ascendra_data". 
La generación de identidades únicas se realiza mediante la API nativa crypto.randomUUID(). 
La exportación a archivo plano JSON se ejecuta mediante un objeto binario Blob (application/json) generado en la memoria RAM, con un nombre de archivo dinámico codificado con la fecha local (ascendra_backup_YYYY-MM-DD.json).



La importación de datos exige una validación estructural estricta antes de sobrescribir LocalStorage (verificando la existencia obligatoria de app_config, user_state y habits) y debe forzar una recarga completa del DOM (location.reload()) para aplicar el nuevo estado.

#### 4. Objetivo de la sesión 
*   **Instrucción para el LLM:** Instrucción para el LLM: El usuario ha completado el paso 4.1 de la hoja de ruta, implementando la memoria volátil y los eventos de interacción de los inputs. El objetivo exclusivo de esta sesión es avanzar en la Fase 4 resolviendo un único hito: el paso 4.2. Implementar la lógica del botón "Cerrar Día": Cambiar el estado is_closed a true. Proporciona el código JavaScript estricto para asignar un evento de clic al botón correspondiente y explica didácticamente cómo se estructura la consolidación inicial de los datos del día en el array daily_logs de la base de datos.