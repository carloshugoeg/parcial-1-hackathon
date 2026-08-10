// Normalización compartida por el motor del agente y sus herramientas:
// minúsculas, sin tildes y sin signos, para comparar texto de forma justa.
export function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function contieneAlguna(texto, palabras) {
  return palabras.some((palabra) => texto.includes(palabra));
}
