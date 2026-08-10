function formatearRestante(milisegundos) {
  if (milisegundos <= 0) {
    return 'plazo vencido';
  }
  const minutosTotales = Math.floor(milisegundos / 60000);
  const dias = Math.floor(minutosTotales / (60 * 24));
  const horas = Math.floor((minutosTotales % (60 * 24)) / 60);
  const minutos = minutosTotales % 60;
  return `quedan ${dias} días, ${horas} horas y ${minutos} minutos`;
}

// Tool recordatorio_tiempo: informa cuánto falta para la fecha límite.
// Un participante ve el desafío de su equipo; los demás roles ven todos.
export function recordatorioTiempo(datos, usuario, ahora = new Date()) {
  let desafios = datos.desafios;
  if (usuario.rol === 'participante') {
    const equipo = datos.equipos.find((e) => e.integrantesIds.includes(usuario.id));
    desafios = datos.desafios.filter((d) => d.id === equipo?.desafioId);
    if (desafios.length === 0) {
      return { lineas: ['Aún no tienes un equipo con desafío asignado. Contacta a la organización.'] };
    }
  }
  const lineas = desafios.map((desafio) => {
    const restante = new Date(desafio.fechaLimite).getTime() - ahora.getTime();
    const fechaLocal = new Date(desafio.fechaLimite).toLocaleString('es-GT', { hour12: false });
    return `«${desafio.titulo}»: cierra el ${fechaLocal} (${formatearRestante(restante)}).`;
  });
  return { lineas };
}
