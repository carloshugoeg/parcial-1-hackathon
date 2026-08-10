import { ErrorDeSolicitud } from '../utils/errores.js';
import { validarTexto, validarEnteroEnRango } from '../utils/validaciones.js';
import { crearId } from '../datos/almacen.js';

// Rúbrica fija del evento: cada criterio vale de 0 a 25 y la nota es la suma (máx. 100).
export const CRITERIOS_RUBRICA = ['innovacion', 'funcionalidad', 'calidadTecnica', 'presentacion'];
export const PUNTAJE_MAXIMO_POR_CRITERIO = 25;

export function registrarEvaluacion(datos, { entregaId, juez, criterios = {}, comentario }) {
  const entrega = datos.entregas.find((n) => n.id === entregaId);
  if (!entrega) {
    throw new ErrorDeSolicitud('La entrega indicada no existe.', 404);
  }
  if (datos.evaluaciones.some((ev) => ev.entregaId === entregaId && ev.juezId === juez.id)) {
    throw new ErrorDeSolicitud('Usted ya registró una evaluación para esta entrega.', 409);
  }

  const puntajes = {};
  for (const criterio of CRITERIOS_RUBRICA) {
    puntajes[criterio] = validarEnteroEnRango(criterios[criterio], criterio, 0, PUNTAJE_MAXIMO_POR_CRITERIO);
  }
  const total = Object.values(puntajes).reduce((suma, puntaje) => suma + puntaje, 0);

  const evaluacion = {
    id: crearId('ev'),
    entregaId,
    juezId: juez.id,
    criterios: puntajes,
    total,
    comentario: validarTexto(comentario, 'comentario', { min: 5, max: 500 }),
    fecha: new Date().toISOString()
  };
  datos.evaluaciones.push(evaluacion);
  return evaluacion;
}

export function calcularNotaDeEntrega(datos, entregaId) {
  const evaluaciones = datos.evaluaciones
    .filter((ev) => ev.entregaId === entregaId)
    .map((ev) => ({
      juez: datos.usuarios.find((u) => u.id === ev.juezId)?.nombre ?? 'Juez',
      criterios: ev.criterios,
      total: ev.total,
      comentario: ev.comentario
    }));
  if (evaluaciones.length === 0) {
    return { estado: 'pendiente', evaluaciones: [] };
  }
  const suma = evaluaciones.reduce((acumulado, ev) => acumulado + ev.total, 0);
  return {
    estado: 'evaluada',
    notaFinal: Math.round((suma / evaluaciones.length) * 10) / 10,
    evaluaciones
  };
}
