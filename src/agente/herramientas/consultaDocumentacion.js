import { normalizarTexto } from '../texto.js';

// Tool consulta_documentacion: responde únicamente con la documentación
// oficial del evento (restricción del prompt del agente: nada fuera de ella).
export function consultaDocumentacion(datos, mensaje) {
  const textoNormalizado = normalizarTexto(mensaje);
  let mejorTema = null;
  let mejorPuntaje = 0;
  for (const tema of datos.documentacion) {
    const puntaje = tema.palabrasClave.filter((palabra) => textoNormalizado.includes(palabra)).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorTema = tema;
    }
  }
  return mejorTema ? { tema: mejorTema.tema, contenido: mejorTema.contenido } : null;
}
