import { normalizarTexto } from '../texto.js';

// Regla del evento: el detector solo marca coincidencias EXACTAS y presenta la
// evidencia; la decisión de descontar puntos siempre queda en manos del juez.
const PALABRAS_POR_FRAGMENTO = 8;

function fragmentosExactos(palabrasA, palabrasB) {
  const ventanasB = new Set();
  for (let i = 0; i + PALABRAS_POR_FRAGMENTO <= palabrasB.length; i++) {
    ventanasB.add(palabrasB.slice(i, i + PALABRAS_POR_FRAGMENTO).join(' '));
  }
  const fragmentos = [];
  let fin = -1;
  for (let i = 0; i + PALABRAS_POR_FRAGMENTO <= palabrasA.length; i++) {
    const ventana = palabrasA.slice(i, i + PALABRAS_POR_FRAGMENTO).join(' ');
    if (!ventanasB.has(ventana)) {
      continue;
    }
    if (i < fin) {
      // La ventana se traslapa con el fragmento anterior: lo extendemos.
      fin = i + PALABRAS_POR_FRAGMENTO;
      fragmentos[fragmentos.length - 1].fin = fin;
    } else {
      fin = i + PALABRAS_POR_FRAGMENTO;
      fragmentos.push({ inicio: i, fin });
    }
  }
  return fragmentos.map((f) => palabrasA.slice(f.inicio, f.fin).join(' '));
}

export function detectorPlagio(datos) {
  const entregas = datos.entregas.map((entrega) => ({
    equipo: datos.equipos.find((e) => e.id === entrega.equipoId)?.nombre ?? 'Desconocido',
    url: entrega.urlRepositorio,
    palabras: normalizarTexto(entrega.descripcion).split(' ')
  }));

  const coincidencias = [];
  for (let a = 0; a < entregas.length; a++) {
    for (let b = a + 1; b < entregas.length; b++) {
      if (entregas[a].url === entregas[b].url) {
        coincidencias.push({
          equipos: [entregas[a].equipo, entregas[b].equipo],
          tipo: 'repositorio idéntico',
          evidencia: entregas[a].url
        });
      }
      for (const fragmento of fragmentosExactos(entregas[a].palabras, entregas[b].palabras)) {
        coincidencias.push({
          equipos: [entregas[a].equipo, entregas[b].equipo],
          tipo: `fragmento exacto de ${fragmento.split(' ').length} palabras`,
          evidencia: `«${fragmento}»`
        });
      }
    }
  }
  return { totalCoincidencias: coincidencias.length, coincidencias };
}
