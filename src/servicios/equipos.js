import { ErrorDeSolicitud } from '../utils/errores.js';
import { validarTexto } from '../utils/validaciones.js';
import { crearId } from '../datos/almacen.js';

function buscarEquipo(datos, equipoId) {
  const equipo = datos.equipos.find((e) => e.id === equipoId);
  if (!equipo) {
    throw new ErrorDeSolicitud('El equipo indicado no existe.', 404);
  }
  return equipo;
}

function buscarUsuarioConRol(datos, usuarioId, rolEsperado) {
  const usuario = datos.usuarios.find((u) => u.id === usuarioId);
  if (!usuario || usuario.rol !== rolEsperado) {
    throw new ErrorDeSolicitud(`Debe seleccionar un usuario con rol ${rolEsperado}.`);
  }
  return usuario;
}

export function crearEquipo(datos, { nombre, desafioId }) {
  const nombreLimpio = validarTexto(nombre, 'nombre', { min: 3, max: 60 });
  if (!datos.desafios.some((d) => d.id === desafioId)) {
    throw new ErrorDeSolicitud('Debe asignar un desafío existente al equipo.');
  }
  if (datos.equipos.some((e) => e.nombre.toLowerCase() === nombreLimpio.toLowerCase())) {
    throw new ErrorDeSolicitud(`Ya existe un equipo con el nombre "${nombreLimpio}".`);
  }
  const equipo = { id: crearId('e'), nombre: nombreLimpio, desafioId, mentorId: null, integrantesIds: [] };
  datos.equipos.push(equipo);
  return equipo;
}

export function agregarIntegrante(datos, { equipoId, usuarioId }) {
  const equipo = buscarEquipo(datos, equipoId);
  const participante = buscarUsuarioConRol(datos, usuarioId, 'participante');
  const equipoActual = datos.equipos.find((e) => e.integrantesIds.includes(usuarioId));
  if (equipoActual) {
    throw new ErrorDeSolicitud(`${participante.nombre} ya pertenece al equipo "${equipoActual.nombre}".`);
  }
  const maximo = datos.configuracion.maxIntegrantesPorEquipo;
  if (equipo.integrantesIds.length >= maximo) {
    throw new ErrorDeSolicitud(`El equipo ya alcanzó el máximo de ${maximo} integrantes.`);
  }
  equipo.integrantesIds.push(usuarioId);
  return equipo;
}

export function asignarMentor(datos, { equipoId, usuarioId }) {
  const equipo = buscarEquipo(datos, equipoId);
  buscarUsuarioConRol(datos, usuarioId, 'mentor');
  equipo.mentorId = usuarioId;
  return equipo;
}

export function listarEquipos(datos) {
  return datos.equipos.map((equipo) => {
    const desafio = datos.desafios.find((d) => d.id === equipo.desafioId);
    const mentor = datos.usuarios.find((u) => u.id === equipo.mentorId);
    return {
      id: equipo.id,
      nombre: equipo.nombre,
      desafio: desafio ? { id: desafio.id, titulo: desafio.titulo, fechaLimite: desafio.fechaLimite } : null,
      mentor: mentor ? mentor.nombre : null,
      integrantes: equipo.integrantesIds.map(
        (id) => datos.usuarios.find((u) => u.id === id)?.nombre ?? 'Desconocido'
      ),
      tieneEntrega: datos.entregas.some((n) => n.equipoId === equipo.id)
    };
  });
}
