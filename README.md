# Hackathon de Innovación Tecnológica URL

Sistema web para administrar el hackathon universitario: **equipos, participantes,
mentores, desafíos, entregas de proyectos y evaluaciones de los jueces**, con un
**agente de IA** que apoya a participantes y organizadores durante el evento.

> Proyecto de la **Evaluación Parcial No. 1 — Programación Web (Serie III)**,
> desarrollado utilizando un agente de IA como apoyo (ver carpeta `evidencias/`).

## Requisitos

- Node.js 20 o superior (se usa `node:test` y `fetch` nativos).
- npm.

## Ejecución

```bash
npm install
npm start
```

Abrir <http://localhost:3000>.

- `npm test` — corre las pruebas (caso exitoso, de error y límite).
- `npm run reiniciar` — restaura los datos de demostración desde la semilla.

Los datos viven en `data/datos.json` (se crea solo, a partir de `data/semilla.json`,
y no se versiona). No se necesita base de datos ni credenciales externas.

## Usuarios de demostración

Todos usan el PIN **1234** (es una demo académica; ver `DECISIONES.md`).

| Usuario   | Nombre          | Rol          |
| --------- | --------------- | ------------ |
| `lucia`   | Lucía Marroquín | Organización |
| `ernesto` | Ernesto Díaz    | Juez         |
| `silvia`  | Silvia Ochoa    | Juez         |
| `marta`   | Marta Solís     | Mentora      |
| `carlos`  | Carlos Escobar  | Participante (Los Compiladores) |
| `ana`     | Ana López       | Participante (Los Compiladores) |
| `pedro`   | Pedro Ramírez   | Participante (Bit a Bit) |
| `maria`   | María Castillo  | Participante (Bit a Bit) |
| `jorge`   | Jorge Batres    | Participante (Runtime Terror) |

## Qué puede hacer cada rol

- **Participante**: ver su equipo, mentor y desafío con cuenta regresiva;
  consultar el detalle de los casos publicados (enunciado y recursos de apoyo);
  registrar la entrega (URL de repositorio de GitHub + descripción) antes de la
  fecha límite; consultar su calificación cuando los jueces evalúan; chatear
  con el agente.
- **Juez**: ver todas las entregas y calificarlas con la rúbrica del evento
  (innovación, funcionalidad, calidad técnica y presentación, 0–25 cada una; la
  nota se suma automáticamente); consultar los casos; usar el detector de
  plagio del agente.
- **Organización**: **publicar los casos** (resumen, detalle del reto y hasta 5
  enlaces de recursos), crear equipos, agregar integrantes, asignar mentores y
  ver el estado general de entregas y notas.
- **Mentor**: seguir el avance de sus equipos asesorados y consultar los casos.

Todos los roles tienen la pestaña **Desafíos**: la lista muestra cada caso con
su estado y cuenta regresiva, y «Ver detalle del caso» abre el enunciado
completo con sus recursos (enlaces públicos a repositorios reales, p. ej.
OpenTripPlanner, GTFS, Leaflet u ODK Collect) y los equipos inscritos.

## El agente de IA del evento

Es un "miembro más del staff" (diseño de la Serie II del parcial). Funciona con un
motor de intenciones determinista que ejecuta herramientas reales sobre los datos
del evento — así la demo es 100 % reproducible sin llaves de API:

| Herramienta             | Qué hace                                                                 | Quién puede usarla |
| ----------------------- | ------------------------------------------------------------------------ | ------------------ |
| `recordatorio_tiempo`   | Informa cuánto falta para la fecha límite de cada desafío.               | Todos              |
| `estado_entregas`       | Resumen de qué equipos entregaron y sus notas.                           | Según el rol       |
| `detector_plagio`       | Compara entregas y reporta solo coincidencias **exactas**, con evidencia. El juez decide si descuenta puntos. | Jueces y organización |
| `consulta_documentacion`| Responde con la documentación oficial del evento (reglas, rúbrica, agenda). | Todos           |

Restricciones del agente (según su prompt de sistema): **no escribe ni corrige
código de los participantes** y **no responde fuera de la documentación del evento**.

## Guion de demostración sugerido

1. Entrar como `carlos` → ver equipo y cuenta regresiva → **Desafíos** → «Ver
   detalle del caso» (enunciado completo y recursos con repos reales) →
   **Entregar proyecto** con una URL de GitHub válida, p. ej.
   `https://github.com/Leaflet/Leaflet` (caso exitoso).
2. Intentar una URL inválida (caso de error con mensaje claro).
3. Entrar como `lucia` (organización) → **Desafíos** → **Publicar un caso**
   (título, resumen, detalle y enlaces de recursos): queda visible de
   inmediato para todos los roles.
4. Preguntar al agente "¿cuánto tiempo queda?" y luego pedirle código (se niega).
5. Salir y entrar como `ernesto` (juez) → evaluar la entrega con la rúbrica →
   la nota se suma sola. Probar "Ejecutar detector de plagio" en el chat.
6. Volver a entrar como `carlos` → **Mi calificación** muestra el veredicto.
7. El desafío "Gestión de residuos" ya está vencido: si `pedro` intenta
   reemplazar la entrega de Bit a Bit, el sistema la rechaza (caso límite).

## Estructura del proyecto

```
server.js               Arranque del servidor
src/app.js              Configuración de Express y montaje de rutas
src/datos/              Almacén JSON (semilla + persistencia)
src/auth/               Sesiones con token y control de roles
src/servicios/          Reglas de negocio (equipos, entregas, evaluaciones)
src/rutas/              Endpoints REST por recurso
src/agente/             Motor del agente y sus herramientas
src/utils/              Validaciones y manejo de errores
public/                 Frontend (HTML, CSS y JavaScript sin frameworks)
test/                   Pruebas con node:test (exitoso, error, límite)
data/semilla.json       Datos de demostración
evidencias/             Evidencias del uso del agente de IA (Serie III)
```

## Documentos del parcial

- [CHECKLIST.md](CHECKLIST.md) — checklist de calidad de software, punto por punto.
- [DECISIONES.md](DECISIONES.md) — decisiones técnicas y su justificación.
- [evidencias/](evidencias/) — análisis del agente, plan de trabajo, revisión de
  código y evidencia del funcionamiento.
