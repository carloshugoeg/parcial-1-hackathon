# Evidencia 2 — Plan de trabajo propuesto por el agente

Plan que el agente propuso (y siguió) tras el análisis del caso. Cada etapa
terminó en un commit con mensaje descriptivo.

## Etapas

1. **Estructura del proyecto** — `package.json`, `.gitignore`, Express como
   única dependencia, repositorio git.
2. **Capa de datos** — semilla JSON con el evento de demostración (usuarios de
   los 4 roles, 3 equipos, 2 desafíos — uno abierto y uno ya vencido para poder
   demostrar el caso de error — 1 entrega previa) + almacén con inicialización,
   lectura, guardado e IDs.
3. **API REST** — sesiones con token y control de roles; rutas y servicios de
   equipos, desafíos, entregas (validación de URL, pertenencia y fecha límite
   inclusiva) y evaluaciones (rúbrica 4×25 con suma automática).
4. **Agente de IA** — motor de intenciones con las reglas del prompt de la
   Serie II y cuatro herramientas: `recordatorio_tiempo`, `detector_plagio`,
   `estado_entregas`, `consulta_documentacion`.
5. **Interfaz web** — mesa de registro con gafetes por rol (estética de
   credencial de evento), vistas por rol, cuenta regresiva en vivo y chat del
   agente con acciones rápidas.
6. **Pruebas** — `node:test` contra un servidor real en puerto efímero con
   datos temporales: caso exitoso, casos de error y casos límite.
7. **Documentación y publicación** — README, CHECKLIST, DECISIONES,
   evidencias, y publicación en GitHub con historial de commits por etapa.

## Criterios de terminado (tomados del checklist del parcial)

- Todas las funcionalidades del caso operando de punta a punta.
- Pruebas de caso exitoso, de error y límite en verde.
- Ningún archivo de credenciales en el repositorio.
- El proyecto corre desde cero siguiendo solo el README.
