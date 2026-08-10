# Checklist de Calidad de Software

Autoevaluación contra el checklist oficial del parcial. Cada criterio indica
dónde verificarlo en el proyecto.

## Cumplimiento del problema

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| El sistema resuelve el caso planteado | Sí | Administra equipos, participantes, mentores, desafíos, entregas y evaluaciones, e incorpora el agente de IA de apoyo. |
| Se implementaron las funcionalidades principales | Sí | Login por rol, gestión de equipos/desafíos (organización), entrega con fecha límite, rúbrica de jueces con suma automática, chat del agente con 4 herramientas. |
| El sistema cumple con los requisitos definidos | Sí | Los requisitos funcionales y no funcionales de la Serie I están mapeados en `evidencias/01-analisis-del-agente.md`. |

## Arquitectura y diseño

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| La estructura del proyecto está organizada | Sí | Capas separadas: `rutas/` (HTTP), `servicios/` (reglas de negocio), `datos/` (persistencia), `agente/` (IA), `public/` (frontend). |
| Existe una adecuada separación de responsabilidades | Sí | Las reglas de negocio son funciones puras que reciben los datos; las rutas solo validan sesión y persisten. |
| Los módulos o archivos tienen un propósito claro | Sí | Un archivo por recurso/herramienta; ver "Estructura del proyecto" en el README. |

## Código limpio

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| Las variables poseen nombres descriptivos | Sí | En español y sin abreviaturas: `registrarEntrega`, `fechaLimite`, `puntajes`. |
| Las funciones tienen una única responsabilidad | Sí | Ej.: `detectorPlagio` solo compara; el motor decide; la ruta responde. |
| No existe código duplicado (DRY) | Sí | Normalización de texto, validaciones y helpers compartidos (`src/agente/texto.js`, `src/utils/validaciones.js`). |
| Se aplicó el principio KISS | Sí | Sin frameworks de frontend, sin base de datos: JSON + Express + vanilla JS. |
| Se evitó agregar funcionalidades innecesarias (YAGNI) | Sí | Solo lo que pide el caso; decisiones de recorte en `DECISIONES.md`. |
| El código mantiene un formato consistente | Sí | Mismo estilo de nombres, comillas e indentación en todo el repositorio. |

## Validaciones y errores

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| Se validan los datos de entrada | Sí | `src/utils/validaciones.js`: textos, URL de GitHub, enteros en rango, fechas ISO. |
| Existe manejo básico de errores | Sí | `ErrorDeSolicitud` + middleware `manejarErrores` (400/401/403/404/409/500). |
| Los mensajes de error son claros para el usuario | Sí | Ej.: «La URL del repositorio debe tener el formato https://github.com/usuario/repositorio.» |

## Pruebas

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| Se verificó un caso exitoso | Sí | `test/entregas.test.js` y `test/evaluaciones.test.js` (entrega válida; evaluación con suma automática). |
| Se verificó un caso de error | Sí | Entrega por equipo ajeno (403), URL inválida (400), rol sin permiso (403), doble evaluación (409). |
| Se verificó un caso límite | Sí | Entrega exactamente a la hora límite (se acepta) y un segundo después (se rechaza); puntajes en los bordes 0 y 25. |

## Uso del agente de IA

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| El agente analizó el caso antes de programar | Sí | `evidencias/01-analisis-del-agente.md`. |
| El agente propuso un plan de trabajo | Sí | `evidencias/02-plan-de-trabajo.md`. |
| El agente revisó parte del código desarrollado | Sí | `evidencias/03-revision-del-codigo.md`. |
| Las recomendaciones del agente fueron analizadas antes de aplicarlas | Sí | Cada hallazgo registra la decisión tomada (aplicado / descartado y por qué). |

## Repositorio GitHub

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| El proyecto fue publicado en GitHub | Sí | Repositorio público con todo el historial. |
| El repositorio contiene un README.md | Sí | Con instrucciones de ejecución, usuarios demo y guion de demostración. |
| Existe un archivo .gitignore correctamente configurado | Sí | Excluye `node_modules/`, `data/datos.json`, `.env` y archivos del sistema. |
| Se realizaron al menos cinco commits con mensajes descriptivos | Sí | Historial por etapas: estructura → datos → API → agente → interfaz → pruebas → documentación. |
| El repositorio no contiene credenciales ni archivos .env | Sí | No hay llaves de API; los PIN «1234» son datos de demostración documentados. |

## Documentación

| Criterio | ✔ | Observaciones |
| --- | --- | --- |
| Se incluyó el archivo DECISIONES.md | Sí | Diez decisiones con contexto y justificación. |
| Se adjuntaron las evidencias solicitadas | Sí | `evidencias/01…04` (análisis, plan, revisión, funcionamiento). |
| El proyecto puede ejecutarse siguiendo el README.md | Sí | `npm install && npm start`; verificado desde cero. |
