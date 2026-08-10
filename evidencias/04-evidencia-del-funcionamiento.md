# Evidencia 4 — Evidencia del funcionamiento

Verificación del sistema completo, realizada el 10 de agosto de 2026.

## 1. Suite de pruebas (caso exitoso, de error y límite)

Salida real de `npm test`:

```
✔ el agente se niega a escribir código para los participantes
✔ el detector de plagio está restringido a jueces y organización
✔ el detector solo marca fragmentos exactos y presenta la evidencia
✔ el detector no marca nada cuando las descripciones son distintas
✔ caso exitoso: un integrante registra la entrega de su equipo antes del límite
✔ caso de error: nadie puede entregar por un equipo al que no pertenece
✔ caso de error: la URL del repositorio debe ser de GitHub
✔ caso límite: la entrega exactamente a la hora límite se acepta, un segundo después se rechaza
✔ caso exitoso: el juez evalúa con la rúbrica y la nota se suma automáticamente
✔ caso de error: un participante no puede registrar evaluaciones
✔ caso de error: un puntaje fuera de la rúbrica se rechaza con mensaje claro
✔ caso límite: los puntajes en los bordes de la rúbrica (0 y 25) se aceptan
✔ caso de error: el mismo juez no puede evaluar dos veces la misma entrega

ℹ tests 14   ℹ pass 14   ℹ fail 0
```

## 2. Verificación de la API (transcripción real con `curl`)

```
--- entrega válida (participante carlos, equipo e1):
{"mensaje":"Entrega registrada con éxito.","entrega":{"id":"n-17f7d4f3", ...}}

--- entrega a equipo ajeno:
{"error":"Solo los integrantes de \"Bit a Bit\" pueden registrar su entrega."}

--- URL inválida:
{"error":"La URL del repositorio debe tener el formato https://github.com/usuario/repositorio."}

--- agente, recordatorio de tiempo:
{"respuesta":"Estos son los plazos vigentes:\n• «Movilidad urbana inteligente»:
 cierra el 1/12/2026, 18:00:00 (quedan 113 días, 7 horas y 54 minutos).",
 "herramienta":"recordatorio_tiempo", ...}

--- agente, participante pide código:
{"respuesta":"Como agente del evento no puedo escribir ni corregir el código de
 los participantes: esa es responsabilidad de tu equipo. ...","herramienta":null}

--- juez evalúa (suma automática):
{"mensaje":"Evaluación registrada. Nota: 81/100.", ...}

--- participante intenta usar el detector de plagio:
{"respuesta":"El detector de plagio solo está disponible para los jueces y la
 organización.","herramienta":null}

--- petición sin sesión:
401 {"error":"Sesión no válida. Inicie sesión de nuevo."}
```

## 3. Verificación en el navegador (flujo completo)

Recorrido realizado en Chrome sobre `http://localhost:3000`:

1. **Mesa de registro**: gafetes de los 9 usuarios agrupados por rol, con el
   color de credencial de cada rol. Login con PIN.
2. **Participante (Ana / Los Compiladores)**: tarjetas de equipo y desafío con
   cuenta regresiva en vivo (`113d 07:47:42`); registro de entrega exitoso con
   mensaje verde «Entrega registrada con éxito.» y estado actualizado.
3. **Agente (participante)**: la acción rápida «¿Cuánto tiempo queda?» ejecutó
   la herramienta `recordatorio_tiempo` (chip visible en el chat); al pedirle
   código, el agente se negó citando sus reglas.
4. **Juez (Ernesto)**: evaluó la entrega con la rúbrica — los puntajes
   22/23/20/21 sumaron 86 automáticamente; la tarjeta cambió a «NOTA 86/100» y
   el formulario se bloqueó («Ya registraste tu evaluación…»).
5. **Agente (juez)**: «Ejecutar detector de plagio» corrió la herramienta
   (sin coincidencias entre las dos entregas reales) y «Estado de entregas»
   devolvió el resumen por equipo con notas.
6. **Caso de error visible en la demo**: el desafío «Gestión de residuos»
   está vencido en la semilla, por lo que cualquier intento de reemplazo de la
   entrega de Bit a Bit se rechaza con el mensaje de fecha límite.

> Capturas de pantalla adicionales pueden tomarse siguiendo el «guion de
> demostración sugerido» del README.
