import { ErrorDeSolicitud } from '../utils/errores.js';
import { validarTexto, validarUrlDeRepositorio } from '../utils/validaciones.js';
import { crearId } from '../datos/almacen.js';
import { calcularNotaDeEntrega } from './evaluaciones.js';

// Regla del evento: la entrega es válida hasta la fecha límite inclusive.
export function registrarEntrega(datos, { equipoId, usuario, urlRepositorio, descripcion, ahora = new Date() }) {
  const equipo = datos.equipos.find((e) => e.id === equipoId);
  if (!equipo) {
    throw new ErrorDeSolicitud('El equipo indicado no existe.', 404);
  }
  if (!equipo.integrantesIds.includes(usuario.id)) {
    throw new ErrorDeSolicitud(
      `Solo los integrantes de "${equipo.nombre}" pueden registrar su entrega.`,
      403
    );
  }
  const desafio = datos.desafios.find((d) => d.id === equipo.desafioId);
  if (!desafio) {
    throw new ErrorDeSolicitud('El equipo no tiene un desafío asignado. Contacte a la organización.');
  }
  const fechaLimite = new Date(desafio.fechaLimite);
  if (ahora.getTime() > fechaLimite.getTime()) {
    throw new ErrorDeSolicitud(
      `La fecha límite del desafío "${desafio.titulo}" ya pasó (${desafio.fechaLimite}). La entrega fue rechazada.`
    );
  }

  const entrega = {
    id: crearId('n'),
    equipoId: equipo.id,
    desafioId: desafio.id,
    urlRepositorio: validarUrlDeRepositorio(urlRepositorio),
    descripcion: validarTexto(descripcion, 'descripcion', { min: 20, max: 500 }),
    fecha: ahora.toISOString(),
    registradaPorId: usuario.id
  };

  // Mientras el desafío siga abierto, la nueva entrega reemplaza a la anterior.
  const indiceAnterior = datos.entregas.findIndex((n) => n.equipoId === equipo.id);
  const reemplazo = indiceAnterior !== -1;
  if (reemplazo) {
    datos.entregas[indiceAnterior] = entrega;
  } else {
    datos.entregas.push(entrega);
  }
  return { entrega, reemplazo };
}

function describirEntrega(datos, entrega) {
  const equipo = datos.equipos.find((e) => e.id === entrega.equipoId);
  const desafio = datos.desafios.find((d) => d.id === entrega.desafioId);
  return {
    ...entrega,
    equipo: equipo ? equipo.nombre : 'Desconocido',
    desafio: desafio ? desafio.titulo : 'Desconocido',
    calificacion: calcularNotaDeEntrega(datos, entrega.id)
  };
}

export function listarEntregasPara(datos, usuario) {
  const todas = datos.entregas.map((entrega) => describirEntrega(datos, entrega));
  if (usuario.rol === 'juez' || usuario.rol === 'organizador') {
    return todas;
  }
  const equiposVisibles = datos.equipos
    .filter((e) =>
      usuario.rol === 'mentor' ? e.mentorId === usuario.id : e.integrantesIds.includes(usuario.id)
    )
    .map((e) => e.id);
  return todas.filter((entrega) => equiposVisibles.includes(entrega.equipoId));
}
