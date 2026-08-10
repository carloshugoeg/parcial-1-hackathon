import { calcularNotaDeEntrega } from '../../servicios/evaluaciones.js';

// Tool estado_entregas: resumen del avance del evento equipo por equipo.
// Un participante solo ve el estado de su propio equipo.
export function estadoEntregas(datos, usuario) {
  let equipos = datos.equipos;
  if (usuario.rol === 'participante') {
    equipos = equipos.filter((e) => e.integrantesIds.includes(usuario.id));
  } else if (usuario.rol === 'mentor') {
    equipos = equipos.filter((e) => e.mentorId === usuario.id);
  }
  const lineas = equipos.map((equipo) => {
    const entrega = datos.entregas.find((n) => n.equipoId === equipo.id);
    if (!entrega) {
      return `${equipo.nombre}: sin entrega registrada.`;
    }
    const calificacion = calcularNotaDeEntrega(datos, entrega.id);
    const estado =
      calificacion.estado === 'evaluada'
        ? `evaluada con nota ${calificacion.notaFinal}/100`
        : 'pendiente de evaluación';
    return `${equipo.nombre}: entregó el ${new Date(entrega.fecha).toLocaleString('es-GT', { hour12: false })} (${estado}).`;
  });
  return { lineas: lineas.length > 0 ? lineas : ['No hay equipos visibles para su rol.'] };
}
