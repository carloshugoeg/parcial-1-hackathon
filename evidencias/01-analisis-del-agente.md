# Evidencia 1 — Análisis del agente antes de programar

Antes de escribir código, el agente de IA (Claude Code) leyó el enunciado del
parcial, el checklist de calidad y la solución en papel de las Series I y II, y
produjo este análisis.

## Comprensión del caso

La universidad organiza un hackathon y necesita un sistema web que administre
**equipos, participantes, mentores, desafíos, entregas de proyectos y
evaluaciones de jueces**, más un **agente de IA** que apoye a participantes y
organizadores durante el evento.

## Ambigüedades detectadas y cómo se resolvieron

Las cinco ambigüedades identificadas en la Serie I se resolvieron consultando
al estudiante (preguntas estructuradas) antes de programar:

| Ambigüedad (Serie I) | Resolución acordada |
| --- | --- |
| ¿Habrá roles con funcionalidades distintas? | Sí: cuatro roles (participante, mentor, juez, organización) con vistas y permisos propios. |
| ¿Qué puede hacer el agente de IA y cómo se implementa? | Agente simulado con motor de intenciones y herramientas reales sobre los datos; sin llaves de API en el repo. |
| ¿Las entregas son tipo git? | Sí: URL de repositorio de GitHub + descripción, validadas por formato y fecha límite. |
| ¿Los jueces tendrán rúbricas establecidas en el sistema? | Sí: rúbrica fija de 4 criterios × 25 puntos con suma automática y promedio entre jueces. |
| ¿Entorno cerrado / hora límite? | Fecha límite por desafío, inclusiva; visibilidad de entregas restringida por rol (un equipo no ve las de otros). |

## Requisitos que guiaron el desarrollo (de la Serie I)

**Funcionales**: login con detección de rol · agrupación de usuarios por equipo ·
registro de entrega del proyecto · sección para que los jueces califiquen ·
panel de desafíos.

**No funcionales**: seguridad (solo el juez registra notas — verificado con
control de roles en el servidor) · autorización (un participante no ve
proyectos ajenos) · claridad de mensajes de error · facilidad de uso (todo el
flujo se completa en pocos clics) · demo reproducible en cualquier máquina.

## Escenarios Given–When–Then (Serie I) → implementación

1. **Límite vencido**: dado que la fecha límite pasó, cuando un equipo intenta
   entregar, el sistema rechaza la entrega → regla en
   `src/servicios/entregas.js` + prueba en `test/entregas.test.js`.
2. **Equipo ajeno**: dado un integrante del equipo Y, cuando intenta entrar al
   proyecto del equipo X, el sistema lo bloquea → validación de pertenencia
   (403) + prueba.
3. **Veredicto del juez**: dado que un equipo entregó, cuando el juez registra
   su veredicto, el sistema muestra la nota al equipo → vista «Mi calificación»
   del participante.

## Tareas de IA vs. responsabilidad humana (Serie I)

Automatizadas por el agente del evento: recordatorios de tiempo, detección de
código copiado (solo evidencia exacta), estado de entregas, consulta de
documentación. **Siguen siendo humanas**: calificar los proyectos y redactar la
retroalimentación, redactar los casos de los desafíos y evaluar la idea o la
creatividad — por eso esas acciones solo existen como formularios del juez y
de la organización, nunca como herramientas del agente.
