// Funciones de renderizado: reciben el estado y devuelven HTML.
// Todo texto dinámico pasa por escaparHtml antes de insertarse.

const NOMBRES_ROL = {
  participante: 'Participante',
  mentor: 'Mentor',
  juez: 'Juez',
  organizador: 'Organización'
};

const CRITERIOS = [
  ['innovacion', 'Innovación'],
  ['funcionalidad', 'Funcionalidad'],
  ['calidadTecnica', 'Calidad técnica'],
  ['presentacion', 'Presentación']
];

export function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function formatearCuentaRegresiva(milisegundos) {
  if (milisegundos <= 0) {
    return 'Plazo vencido';
  }
  const segundosTotales = Math.floor(milisegundos / 1000);
  const dias = Math.floor(segundosTotales / 86400);
  const horas = String(Math.floor((segundosTotales % 86400) / 3600)).padStart(2, '0');
  const minutos = String(Math.floor((segundosTotales % 3600) / 60)).padStart(2, '0');
  const segundos = String(segundosTotales % 60).padStart(2, '0');
  return `${dias}d ${horas}:${minutos}:${segundos}`;
}

function fechaLocal(iso) {
  return new Date(iso).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short', hour12: false });
}

function cuentaRegresiva(fechaLimite) {
  const restante = new Date(fechaLimite).getTime() - Date.now();
  const clase = restante <= 0 ? 'cuenta-regresiva vencida' : 'cuenta-regresiva';
  return `<div class="${clase}" data-fecha-limite="${escaparHtml(fechaLimite)}">${formatearCuentaRegresiva(restante)}</div>`;
}

function mensajeGlobal(estado) {
  if (!estado.mensaje) {
    return '';
  }
  return `<p class="mensaje ${estado.mensaje.tipo}" role="status">${escaparHtml(estado.mensaje.texto)}</p>`;
}

/* ---------- Mesa de registro ---------- */

export function vistaRegistro(estado) {
  const porRol = ['participante', 'mentor', 'juez', 'organizador'].map((rol) => {
    const gafetes = estado.gafetes.filter((g) => g.rol === rol);
    if (gafetes.length === 0) {
      return '';
    }
    return `
      <section class="grupo-rol">
        <h2>${NOMBRES_ROL[rol]}</h2>
        <div class="gafetes">
          ${gafetes
            .map(
              (g) => `
            <button type="button" class="gafete ${estado.seleccionadoId === g.id ? 'seleccionado' : ''}"
                    data-accion="elegir-gafete" data-id="${g.id}" data-rol="${g.rol}"
                    aria-label="Entrar como ${escaparHtml(g.nombre)} (${NOMBRES_ROL[g.rol]})">
              <span class="banda">${NOMBRES_ROL[g.rol]}</span>
              <span class="cuerpo">
                <span class="nombre">${escaparHtml(g.nombre)}</span><br />
                <span class="usuario">@${escaparHtml(g.usuario)}</span>
              </span>
            </button>`
            )
            .join('')}
        </div>
      </section>`;
  });

  const seleccionado = estado.gafetes.find((g) => g.id === estado.seleccionadoId);
  const formulario = seleccionado
    ? `
      <form class="formulario-pin" data-formulario="iniciar-sesion" data-rol="${seleccionado.rol}">
        <h2>Recoger credencial</h2>
        <p class="pista">Entrarás como <strong>${escaparHtml(seleccionado.nombre)}</strong> (${NOMBRES_ROL[seleccionado.rol]}). PIN de demostración: 1234.</p>
        <label for="pin">PIN</label>
        <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" required />
        <div class="acciones-tarjeta"><button type="submit">Entrar al evento</button></div>
      </form>`
    : '<p class="pista" style="color:var(--tinta-suave)">Elige tu gafete para entrar.</p>';

  return `
    <div class="registro">
      <header class="registro-encabezado">
        <p class="evento">Universidad Rafael Landívar · Mesa de registro</p>
        <h1>Hackathon de Innovación Tecnológica</h1>
        <p>Equipos, mentores, desafíos, entregas y evaluaciones — con un agente de IA de apoyo.</p>
      </header>
      ${mensajeGlobal(estado)}
      ${porRol.join('')}
      ${formulario}
    </div>`;
}

/* ---------- Estructura de la aplicación ---------- */

const PESTANAS_POR_ROL = {
  participante: [
    ['equipo', 'Mi equipo'],
    ['desafios', 'Desafíos'],
    ['entrega', 'Entregar proyecto'],
    ['calificacion', 'Mi calificación'],
    ['agente', 'Agente IA']
  ],
  juez: [
    ['entregas', 'Entregas'],
    ['desafios', 'Desafíos'],
    ['agente', 'Agente IA']
  ],
  organizador: [
    ['equipos', 'Equipos'],
    ['desafios', 'Desafíos'],
    ['entregas', 'Entregas'],
    ['agente', 'Agente IA']
  ],
  mentor: [
    ['equipos', 'Mis equipos'],
    ['desafios', 'Desafíos'],
    ['agente', 'Agente IA']
  ]
};

export function vistaInicialPara(rol) {
  return PESTANAS_POR_ROL[rol][0][0];
}

export function vistaApp(estado) {
  const { perfil } = estado.sesion;
  const pestanas = PESTANAS_POR_ROL[perfil.rol]
    .map(
      ([id, titulo]) =>
        `<button type="button" class="${estado.vista === id ? 'activa' : ''}" data-accion="cambiar-vista" data-vista="${id}">${titulo}</button>`
    )
    .join('');

  return `
    <div data-rol="${perfil.rol}">
      <header class="barra">
        <div class="marca">Hackathon <span>URL</span></div>
        <div class="credencial">
          <div class="quien">
            <strong>${escaparHtml(perfil.nombre)}</strong>
            <small>${NOMBRES_ROL[perfil.rol]}</small>
          </div>
          <button type="button" data-accion="salir">Salir</button>
        </div>
      </header>
      <nav class="pestanas" aria-label="Secciones">${pestanas}</nav>
      <main>
        ${mensajeGlobal(estado)}
        ${contenidoDeVista(estado)}
      </main>
    </div>`;
}

function contenidoDeVista(estado) {
  const rol = estado.sesion.perfil.rol;
  if (estado.vista === 'agente') {
    return vistaAgente(estado);
  }
  if (estado.vista === 'desafios') {
    return vistaDesafios(estado);
  }
  if (rol === 'participante') {
    if (estado.vista === 'equipo') return vistaMiEquipo(estado);
    if (estado.vista === 'entrega') return vistaEntregar(estado);
    if (estado.vista === 'calificacion') return vistaCalificacion(estado);
  }
  if (rol === 'juez') {
    return vistaEntregasJuez(estado);
  }
  if (rol === 'organizador') {
    if (estado.vista === 'equipos') return vistaEquiposOrganizador(estado);
    if (estado.vista === 'entregas') return vistaEntregasOrganizador(estado);
  }
  if (rol === 'mentor') {
    return vistaEquiposMentor(estado);
  }
  return '<p>Vista no disponible.</p>';
}

function miEquipo(estado) {
  const miId = estado.sesion.perfil.id;
  return estado.datos.equipos.find((e) => e.integrantesIds.includes(miId)) ?? null;
}

/* ---------- Vistas de participante ---------- */

function vistaMiEquipo(estado) {
  const equipo = miEquipo(estado);
  if (!equipo) {
    return '<div class="tarjeta"><h3>Sin equipo asignado</h3><p class="meta">Pide a la organización que te agregue a un equipo.</p></div>';
  }
  const entrega = estado.datos.entregas.find((n) => n.equipoId === equipo.id);
  return `
    <div class="tarjetas">
      <section class="tarjeta">
        <span class="etiqueta">Equipo</span>
        <h3>${escaparHtml(equipo.nombre)}</h3>
        <p class="meta">Integrantes: ${equipo.integrantes.map(escaparHtml).join(', ')}</p>
        <p class="meta">Mentor: ${escaparHtml(equipo.mentor ?? 'Sin asignar')}</p>
        <p class="meta">Entrega: ${entrega ? `registrada el ${fechaLocal(entrega.fecha)}` : 'aún sin registrar'}</p>
      </section>
      <section class="tarjeta">
        <span class="etiqueta">Desafío</span>
        <h3>${escaparHtml(equipo.desafio?.titulo ?? 'Sin desafío')}</h3>
        ${equipo.desafio ? `<p class="meta">Cierra: ${fechaLocal(equipo.desafio.fechaLimite)}</p>${cuentaRegresiva(equipo.desafio.fechaLimite)}` : ''}
      </section>
    </div>`;
}

function vistaEntregar(estado) {
  const equipo = miEquipo(estado);
  if (!equipo) {
    return '<div class="tarjeta"><h3>Sin equipo asignado</h3><p class="meta">Necesitas un equipo para registrar una entrega.</p></div>';
  }
  const entrega = estado.datos.entregas.find((n) => n.equipoId === equipo.id);
  return `
    <div class="tarjetas">
      <section class="tarjeta">
        <span class="etiqueta">Entrega de ${escaparHtml(equipo.nombre)}</span>
        <h3>Registrar proyecto</h3>
        <form data-formulario="entregar" data-equipo-id="${equipo.id}">
          <label for="urlRepositorio">URL del repositorio (GitHub)</label>
          <input id="urlRepositorio" name="urlRepositorio" type="url"
                 placeholder="https://github.com/equipo/proyecto" required />
          <label for="descripcion">Descripción del proyecto</label>
          <textarea id="descripcion" name="descripcion" rows="4" minlength="20" maxlength="500" required
                    placeholder="¿Qué construyeron y cómo resuelve el desafío?"></textarea>
          <div class="acciones-tarjeta"><button type="submit">Registrar entrega</button></div>
        </form>
      </section>
      <section class="tarjeta">
        <span class="etiqueta">Estado actual</span>
        ${
          entrega
            ? `<h3>Entrega registrada</h3>
               <p class="meta">Fecha: ${fechaLocal(entrega.fecha)}</p>
               <p class="meta">Repositorio: <a href="${escaparHtml(entrega.urlRepositorio)}" target="_blank" rel="noreferrer">${escaparHtml(entrega.urlRepositorio)}</a></p>
               <p class="meta">Mientras el desafío siga abierto puedes reemplazarla.</p>`
            : `<h3>Sin entrega</h3><p class="meta">Tu equipo todavía no registra su proyecto.</p>`
        }
        ${equipo.desafio ? cuentaRegresiva(equipo.desafio.fechaLimite) : ''}
      </section>
    </div>`;
}

function vistaCalificacion(estado) {
  const equipo = miEquipo(estado);
  const entrega = equipo && estado.datos.entregas.find((n) => n.equipoId === equipo.id);
  if (!entrega) {
    return '<div class="tarjeta"><h3>Sin calificación</h3><p class="meta">Cuando tu equipo entregue y los jueces evalúen, verás aquí tu nota.</p></div>';
  }
  const calificacion = entrega.calificacion;
  if (calificacion.estado !== 'evaluada') {
    return `<div class="tarjeta"><span class="etiqueta">${escaparHtml(entrega.desafio)}</span>
      <h3>Evaluación pendiente</h3>
      <p class="meta">Tu entrega fue registrada el ${fechaLocal(entrega.fecha)}. Los jueces aún no publican su veredicto.</p></div>`;
  }
  return `
    <div class="tarjeta">
      <span class="etiqueta evaluada">Evaluada</span>
      <h3>${escaparHtml(equipo.nombre)} — ${escaparHtml(entrega.desafio)}</h3>
      <div class="nota-grande">${calificacion.notaFinal} <small>/ 100</small></div>
      <table>
        <thead><tr><th>Juez</th>${CRITERIOS.map(([, titulo]) => `<th>${titulo}</th>`).join('')}<th>Total</th><th>Comentario</th></tr></thead>
        <tbody>
          ${calificacion.evaluaciones
            .map(
              (ev) => `<tr><td>${escaparHtml(ev.juez)}</td>
                ${CRITERIOS.map(([clave]) => `<td>${ev.criterios[clave]}</td>`).join('')}
                <td><strong>${ev.total}</strong></td><td>${escaparHtml(ev.comentario)}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Vista de juez ---------- */

function vistaEntregasJuez(estado) {
  if (estado.datos.entregas.length === 0) {
    return '<div class="tarjeta"><h3>Sin entregas</h3><p class="meta">Todavía ningún equipo ha registrado su proyecto.</p></div>';
  }
  const nombreJuez = estado.sesion.perfil.nombre;
  return `<div class="tarjetas">${estado.datos.entregas
    .map((entrega) => {
      const yaEvaluada = entrega.calificacion.evaluaciones.some((ev) => ev.juez === nombreJuez);
      return `
      <section class="tarjeta">
        <span class="etiqueta ${entrega.calificacion.estado === 'evaluada' ? 'evaluada' : ''}">
          ${entrega.calificacion.estado === 'evaluada' ? `Nota ${entrega.calificacion.notaFinal}/100` : 'Pendiente'}
        </span>
        <h3>${escaparHtml(entrega.equipo)}</h3>
        <p class="meta">Desafío: ${escaparHtml(entrega.desafio)}</p>
        <p class="meta">Repositorio: <a href="${escaparHtml(entrega.urlRepositorio)}" target="_blank" rel="noreferrer">${escaparHtml(entrega.urlRepositorio)}</a></p>
        <p class="meta">Entregado: ${fechaLocal(entrega.fecha)}</p>
        <p>${escaparHtml(entrega.descripcion)}</p>
        ${
          yaEvaluada
            ? '<p class="meta"><strong>Ya registraste tu evaluación para esta entrega.</strong></p>'
            : `
        <form data-formulario="evaluar" data-entrega-id="${entrega.id}">
          <div class="rubrica">
            ${CRITERIOS.map(
              ([clave, titulo]) => `
              <div>
                <label for="${clave}-${entrega.id}">${titulo} (0–25)</label>
                <input id="${clave}-${entrega.id}" name="${clave}" class="puntaje" type="number" min="0" max="25" step="1" value="0" required />
              </div>`
            ).join('')}
          </div>
          <p class="total-rubrica">Total: <span data-total>0</span>/100</p>
          <label for="comentario-${entrega.id}">Comentario para el equipo</label>
          <textarea id="comentario-${entrega.id}" name="comentario" rows="2" minlength="5" required></textarea>
          <div class="acciones-tarjeta"><button type="submit">Registrar evaluación</button></div>
        </form>`
        }
      </section>`;
    })
    .join('')}</div>`;
}

/* ---------- Vistas de organización ---------- */

function opciones(lista, valor, etiqueta) {
  return lista.map((item) => `<option value="${escaparHtml(item[valor])}">${escaparHtml(item[etiqueta])}</option>`).join('');
}

function vistaEquiposOrganizador(estado) {
  const { equipos, usuarios, desafios } = estado.datos;
  const participantesSinEquipo = usuarios.filter((u) => u.rol === 'participante' && !u.equipo);
  const mentores = usuarios.filter((u) => u.rol === 'mentor');
  return `
    <div class="tarjeta" style="margin-bottom:16px">
      <h3>Equipos registrados</h3>
      <table>
        <thead><tr><th>Equipo</th><th>Desafío</th><th>Integrantes</th><th>Mentor</th><th>Entrega</th></tr></thead>
        <tbody>
          ${equipos
            .map(
              (e) => `<tr><td><strong>${escaparHtml(e.nombre)}</strong></td>
              <td>${escaparHtml(e.desafio?.titulo ?? '—')}</td>
              <td>${e.integrantes.map(escaparHtml).join(', ') || '—'}</td>
              <td>${escaparHtml(e.mentor ?? '—')}</td>
              <td>${e.tieneEntrega ? 'Sí' : 'No'}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="tarjetas">
      <section class="tarjeta">
        <h3>Crear equipo</h3>
        <form data-formulario="crear-equipo">
          <label for="nombreEquipo">Nombre del equipo</label>
          <input id="nombreEquipo" name="nombre" minlength="3" maxlength="60" required />
          <label for="desafioEquipo">Desafío asignado</label>
          <select id="desafioEquipo" name="desafioId" required>${opciones(desafios, 'id', 'titulo')}</select>
          <div class="acciones-tarjeta"><button type="submit">Crear equipo</button></div>
        </form>
      </section>
      <section class="tarjeta">
        <h3>Agregar integrante</h3>
        ${
          participantesSinEquipo.length === 0
            ? '<p class="meta">Todos los participantes ya tienen equipo.</p>'
            : `
        <form data-formulario="agregar-integrante">
          <label for="equipoIntegrante">Equipo</label>
          <select id="equipoIntegrante" name="equipoId" required>${opciones(equipos, 'id', 'nombre')}</select>
          <label for="usuarioIntegrante">Participante sin equipo</label>
          <select id="usuarioIntegrante" name="usuarioId" required>${opciones(participantesSinEquipo, 'id', 'nombre')}</select>
          <div class="acciones-tarjeta"><button type="submit">Agregar</button></div>
        </form>`
        }
      </section>
      <section class="tarjeta">
        <h3>Asignar mentor</h3>
        <form data-formulario="asignar-mentor">
          <label for="equipoMentor">Equipo</label>
          <select id="equipoMentor" name="equipoId" required>${opciones(equipos, 'id', 'nombre')}</select>
          <label for="usuarioMentor">Mentor</label>
          <select id="usuarioMentor" name="usuarioId" required>${opciones(mentores, 'id', 'nombre')}</select>
          <div class="acciones-tarjeta"><button type="submit">Asignar</button></div>
        </form>
      </section>
    </div>`;
}

function vistaDesafios(estado) {
  const seleccionado = estado.datos.desafios.find((d) => d.id === estado.desafioSeleccionadoId);
  if (seleccionado) {
    return vistaDetalleDesafio(estado, seleccionado);
  }
  const tarjetas = estado.datos.desafios
    .map(
      (d) => `
    <section class="tarjeta">
      <span class="etiqueta ${d.abierto ? 'abierto' : 'cerrado'}">${d.abierto ? 'Abierto' : 'Cerrado'}</span>
      <h3>${escaparHtml(d.titulo)}</h3>
      <p class="meta">${escaparHtml(d.descripcion)}</p>
      <p class="meta">Equipos inscritos: ${d.equipos.length}</p>
      <p class="meta">Cierra: ${fechaLocal(d.fechaLimite)}</p>
      ${cuentaRegresiva(d.fechaLimite)}
      <div class="acciones-tarjeta">
        <button type="button" data-accion="ver-desafio" data-id="${d.id}">Ver detalle del caso</button>
      </div>
    </section>`
    )
    .join('');

  const formularioPublicar =
    estado.sesion.perfil.rol === 'organizador'
      ? `
      <section class="tarjeta">
        <h3>Publicar un caso</h3>
        <form data-formulario="crear-desafio">
          <label for="tituloDesafio">Título</label>
          <input id="tituloDesafio" name="titulo" minlength="5" maxlength="80" required />
          <label for="descripcionDesafio">Resumen (aparece en la lista)</label>
          <textarea id="descripcionDesafio" name="descripcion" rows="2" minlength="20" maxlength="500" required></textarea>
          <label for="detalleDesafio">Detalle del caso (contexto, reto y entregables)</label>
          <textarea id="detalleDesafio" name="detalle" rows="6" minlength="30" maxlength="2000" required></textarea>
          <label for="recursosDesafio">Recursos de apoyo (un enlace https:// por línea, máx. 5, opcional)</label>
          <textarea id="recursosDesafio" name="recursos" rows="3" placeholder="https://github.com/Leaflet/Leaflet"></textarea>
          <label for="fechaLimiteDesafio">Fecha límite</label>
          <input id="fechaLimiteDesafio" name="fechaLimite" type="datetime-local" required />
          <div class="acciones-tarjeta"><button type="submit">Publicar caso</button></div>
        </form>
      </section>`
      : '';

  return `<div class="tarjetas">${tarjetas}${formularioPublicar}</div>`;
}

function vistaDetalleDesafio(estado, desafio) {
  const equiposInscritos = estado.datos.equipos.filter((e) => e.desafio?.id === desafio.id);
  const recursos = (desafio.recursos ?? [])
    .map(
      (url) =>
        `<li><a href="${escaparHtml(url)}" target="_blank" rel="noreferrer">${escaparHtml(url)}</a></li>`
    )
    .join('');
  return `
    <button type="button" class="volver" data-accion="volver-desafios">← Volver a desafíos</button>
    <div class="tarjeta">
      <span class="etiqueta ${desafio.abierto ? 'abierto' : 'cerrado'}">${desafio.abierto ? 'Abierto' : 'Cerrado'}</span>
      <h2>${escaparHtml(desafio.titulo)}</h2>
      <p class="meta">Cierra: ${fechaLocal(desafio.fechaLimite)}</p>
      ${cuentaRegresiva(desafio.fechaLimite)}
      <p>${escaparHtml(desafio.descripcion)}</p>
      <h3>Detalle del caso</h3>
      <p class="texto-detalle">${escaparHtml(desafio.detalle ?? 'La organización aún no publica el detalle de este caso.')}</p>
      ${recursos ? `<h3>Recursos de apoyo</h3><ul class="recursos">${recursos}</ul>` : ''}
      <h3>Equipos inscritos</h3>
      ${
        equiposInscritos.length === 0
          ? '<p class="meta">Todavía no hay equipos asignados a este desafío.</p>'
          : `<ul class="recursos">${equiposInscritos
              .map(
                (e) =>
                  `<li>${escaparHtml(e.nombre)} — ${e.tieneEntrega ? 'ya entregó' : 'sin entrega'}</li>`
              )
              .join('')}</ul>`
      }
    </div>`;
}

function vistaEntregasOrganizador(estado) {
  const { equipos, entregas } = estado.datos;
  return `
    <div class="tarjeta">
      <h3>Estado de entregas</h3>
      <table>
        <thead><tr><th>Equipo</th><th>Desafío</th><th>Entrega</th><th>Calificación</th></tr></thead>
        <tbody>
          ${equipos
            .map((equipo) => {
              const entrega = entregas.find((n) => n.equipoId === equipo.id);
              const calificacion = entrega?.calificacion;
              return `<tr>
                <td><strong>${escaparHtml(equipo.nombre)}</strong></td>
                <td>${escaparHtml(equipo.desafio?.titulo ?? '—')}</td>
                <td>${entrega ? fechaLocal(entrega.fecha) : 'Sin entrega'}</td>
                <td>${calificacion?.estado === 'evaluada' ? `${calificacion.notaFinal}/100` : 'Pendiente'}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Vista de mentor ---------- */

function vistaEquiposMentor(estado) {
  const miId = estado.sesion.perfil.id;
  const misEquipos = estado.datos.equipos.filter((e) => e.mentorId === miId);
  if (misEquipos.length === 0) {
    return '<div class="tarjeta"><h3>Sin equipos asignados</h3><p class="meta">La organización aún no te asigna equipos.</p></div>';
  }
  return `<div class="tarjetas">${misEquipos
    .map((equipo) => {
      const entrega = estado.datos.entregas.find((n) => n.equipoId === equipo.id);
      return `
      <section class="tarjeta">
        <span class="etiqueta">Equipo asesorado</span>
        <h3>${escaparHtml(equipo.nombre)}</h3>
        <p class="meta">Integrantes: ${equipo.integrantes.map(escaparHtml).join(', ')}</p>
        <p class="meta">Desafío: ${escaparHtml(equipo.desafio?.titulo ?? '—')}</p>
        <p class="meta">Entrega: ${entrega ? `registrada el ${fechaLocal(entrega.fecha)}` : 'sin registrar'}</p>
        ${equipo.desafio ? cuentaRegresiva(equipo.desafio.fechaLimite) : ''}
      </section>`;
    })
    .join('')}</div>`;
}

/* ---------- Chat del agente ---------- */

const ACCIONES_RAPIDAS = {
  participante: ['¿Cuánto tiempo queda?', '¿Cómo se evalúa?', '¿Cuáles son las reglas?'],
  mentor: ['Estado de mis equipos', '¿Cuánto tiempo queda?', '¿Cuáles son las reglas?'],
  juez: ['Ejecutar detector de plagio', 'Estado de entregas', '¿Cómo se evalúa?'],
  organizador: ['Estado de entregas', 'Ejecutar detector de plagio', 'Agenda del evento']
};

function vistaAgente(estado) {
  const mensajes =
    estado.chat.length === 0
      ? '<p class="meta" style="padding:0 4px">Escríbele al agente del evento o usa una acción rápida. Solo responde temas documentados del hackathon.</p>'
      : estado.chat
          .map((m) => {
            if (m.de === 'usuario') {
              return `<div class="burbuja usuario">${escaparHtml(m.texto)}</div>`;
            }
            const chip = m.herramienta ? `<span class="herramienta">tool · ${escaparHtml(m.herramienta)}</span><br />` : '';
            return `<div class="burbuja agente">${chip}${escaparHtml(m.texto)}</div>`;
          })
          .join('');

  const acciones = ACCIONES_RAPIDAS[estado.sesion.perfil.rol]
    .map((texto) => `<button type="button" data-accion="accion-rapida" data-mensaje="${escaparHtml(texto)}">${escaparHtml(texto)}</button>`)
    .join('');

  return `
    <div class="chat">
      <div class="chat-mensajes" data-chat-mensajes>${mensajes}</div>
      <div class="chat-acciones">${acciones}</div>
      <form class="chat-formulario" data-formulario="chat">
        <input name="mensaje" placeholder="Pregúntale al agente del evento…" maxlength="300" autocomplete="off" required />
        <button type="submit">Enviar</button>
      </form>
    </div>`;
}
