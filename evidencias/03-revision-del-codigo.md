# Evidencia 3 — Revisión del código por el agente

Hallazgos de la revisión del código durante y después del desarrollo. Cada
recomendación fue **analizada antes de aplicarse**: se registra la decisión y
su porqué (criterio del checklist).

## Hallazgos corregidos

1. **Banda del gafete renderizada como chip** (`public/css/estilos.css`).
   Los `<span>` internos del botón-gafete son elementos inline, así que la
   banda de color del rol no ocupaba el ancho de la tarjeta. *Recomendación:*
   `display: block` en `.banda` y `.cuerpo`. **Aplicada** — verificada con
   captura de pantalla antes/después.

2. **Script de pruebas fallaba** (`package.json`). `node --test test/` no
   resolvía el directorio en esta versión de Node y tumbaba la suite completa.
   *Recomendación:* usar `node --test` (descubrimiento automático).
   **Aplicada** — las 14 pruebas pasan.

3. **Gafetes sin nombre accesible** (`public/js/vistas.js`). El árbol de
   accesibilidad mostraba los botones de la mesa de registro sin etiqueta.
   *Recomendación:* `aria-label="Entrar como {nombre} ({rol})"`.
   **Aplicada** — verificada leyendo el árbol de accesibilidad del navegador.

4. **Rango Unicode ambiguo en la normalización** (`src/agente/texto.js`).
   El regex que elimina tildes usaba caracteres combinantes literales,
   difíciles de leer y frágiles al copiar. Se verificó su comportamiento con
   una prueba directa («¿Cuánto TIEMPO falta? ¡Evaluación!» →
   `cuanto tiempo falta evaluacion`). **Verificado y documentado con
   comentario**; se mantuvo al comprobarse correcto.

## Recomendaciones analizadas y descartadas (con justificación)

5. **Advertencia de seguridad sobre `innerHTML`** (regla automática del
   entorno). Sugería migrar a `textContent`/DOM API o usar DOMPurify.
   *Análisis:* todo dato dinámico ya pasa por `escaparHtml` (incluidos
   atributos), y reescribir el renderizado con la DOM API o sumar una
   dependencia externa no aportaba al alcance del parcial. **Descartada**;
   la mitigación quedó documentada en `DECISIONES.md` (§9).

6. **Hash de contraseñas (bcrypt) para los PIN.** Correcto para producción,
   pero los PIN son datos de demostración públicos («1234») y el checklist
   prohíbe credenciales reales, no datos semilla. **Descartada por alcance**;
   decisión explícita en `DECISIONES.md` (§7).

## Verificaciones transversales

- Los errores lanzados en middleware llegan al manejador central (Express 5):
  peticiones sin token responden `401 {"error":"Sesión no válida…"}` —
  comprobado con `curl`.
- Ninguna respuesta de la API expone el PIN de los usuarios (`perfilPublico`).
- La visibilidad de entregas se filtra por rol en el servidor, no en el
  cliente (`listarEntregasPara`).
