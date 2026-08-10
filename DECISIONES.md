# Decisiones técnicas

Registro de las decisiones tomadas durante el desarrollo, con su contexto y
justificación. Las ambigüedades del caso se resolvieron en conjunto con el
estudiante antes de programar (ver `evidencias/01-analisis-del-agente.md`).

## 1. Stack: Node.js + Express + JavaScript vanilla

Se eligió el stack más simple que resuelve el caso completo: API REST con
Express y frontend sin frameworks. Cualquiera puede correr la demo con
`npm install && npm start`, sin base de datos ni cuentas externas, y todo el
código es explicable línea por línea (importante para la defensa del parcial).

## 2. Persistencia en archivo JSON con semilla

`data/semilla.json` (versionada) contiene los datos de demostración;
`data/datos.json` (ignorada por git) es la copia de trabajo que el servidor crea
y muta. `npm run reiniciar` restaura la demo en un comando. Una base de datos
real sería más robusta, pero agregaba instalación y credenciales sin sumar
puntos del caso (YAGNI).

## 3. Agente de IA simulado con herramientas reales

El checklist exige que el repositorio no contenga credenciales, y la demo debe
funcionar siempre (aula sin internet, revisor sin llaves de API). Por eso el
agente usa un motor de intenciones determinista que ejecuta herramientas
reales sobre los datos del evento — exactamente las diseñadas en la Serie II:
`recordatorio_tiempo`, `detector_plagio`, `estado_entregas` y
`consulta_documentacion`. El contrato (prompt, reglas, restricciones) está
implementado en `src/agente/motor.js`:

- Es «un miembro más del staff» del evento.
- No escribe ni corrige código de los participantes.
- No responde fuera de la documentación oficial.
- El detector de plagio solo marca coincidencias exactas y presenta evidencia;
  la decisión de descontar puntos es del juez.

## 4. Entrega = URL de repositorio + descripción

Resuelve la ambigüedad «¿cómo entregan los equipos?»: registran la URL pública
de GitHub y una descripción. Es coherente con la herramienta
`Detector_plagio(link_repo, descripción)` diseñada en la Serie II y evita
manejar archivos subidos (tamaños, tipos, almacenamiento).

## 5. Fecha límite inclusiva

Regla explícita para el caso límite: una entrega **exactamente a la hora
límite se acepta**; un milisegundo después se rechaza con mensaje claro. Está
cubierta por pruebas (`test/entregas.test.js`). Mientras el desafío siga
abierto, una nueva entrega del equipo reemplaza a la anterior.

## 6. Rúbrica fija con suma automática

Los jueces califican cuatro criterios (innovación, funcionalidad, calidad
técnica, presentación) de 0 a 25; el sistema suma la nota (máx. 100) y promedia
entre jueces. Un juez no puede evaluar dos veces la misma entrega. Esto
implementa el diseño de la Serie II («rúbrica predefinida que suma puntos
automáticamente») y elimina errores de cálculo manual.

## 7. PIN «1234» en la semilla (decisión consciente)

Es un sistema de demostración académica: los PIN son datos de ejemplo
documentados en el README, no credenciales reales. En producción se usarían
contraseñas con hash (bcrypt) y expiración de sesión; se dejó fuera por alcance
del parcial y se declara aquí para que la decisión sea explícita.

## 8. Sesiones con token en memoria

`crypto.randomBytes` genera el token; el mapa vive en memoria del servidor.
Si el servidor se reinicia, el frontend detecta la sesión inválida y vuelve a
la mesa de registro. Suficiente para un evento con un solo servidor (KISS).

## 9. Renderizado con plantillas y escape sistemático

El frontend arma las vistas con template strings e `innerHTML`. Todo dato
dinámico (nombres, descripciones, URLs, mensajes del chat) pasa por
`escaparHtml` antes de insertarse, incluyendo atributos, para mitigar XSS.
Se eligió esta técnica por transparencia didáctica frente a un framework.

## 10. Detector de plagio: solo evidencia exacta

Compara pares de entregas: URLs idénticas y fragmentos exactos de 8+ palabras
(texto normalizado: minúsculas, sin tildes ni signos). No usa similitud difusa
a propósito — la restricción de diseño dice «solo marcar código exacto y
presentar evidencia» — así el agente nunca acusa por parecidos casuales y el
criterio final queda en el juez.
