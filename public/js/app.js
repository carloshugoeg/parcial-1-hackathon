import { llamarApi, obtenerSesion, guardarSesion, borrarSesion } from './api.js';
import { vistaRegistro, vistaApp, vistaInicialPara, formatearCuentaRegresiva } from './vistas.js';

const raiz = document.getElementById('app');

const estado = {
  sesion: obtenerSesion(),
  gafetes: [],
  seleccionadoId: null,
  vista: null,
  datos: { equipos: [], desafios: [], entregas: [], usuarios: [] },
  chat: [],
  mensaje: null
};

function renderizar() {
  raiz.innerHTML = estado.sesion ? vistaApp(estado) : vistaRegistro(estado);
  const contenedorChat = raiz.querySelector('[data-chat-mensajes]');
  if (contenedorChat) {
    contenedorChat.scrollTop = contenedorChat.scrollHeight;
  }
}

function mostrarMensaje(tipo, texto) {
  estado.mensaje = { tipo, texto };
  renderizar();
  estado.mensaje = null;
}

async function cargarDatos() {
  const rol = estado.sesion.perfil.rol;
  const [equipos, desafios, entregas] = await Promise.all([
    llamarApi('/equipos'),
    llamarApi('/desafios'),
    llamarApi('/entregas')
  ]);
  estado.datos = { ...estado.datos, equipos, desafios, entregas };
  if (rol === 'organizador') {
    estado.datos.usuarios = await llamarApi('/usuarios');
  }
}

async function iniciar() {
  if (estado.sesion) {
    try {
      await cargarDatos();
      estado.vista = estado.vista ?? vistaInicialPara(estado.sesion.perfil.rol);
    } catch {
      // La sesión guardada ya no es válida (p. ej. el servidor se reinició).
      borrarSesion();
      estado.sesion = null;
    }
  }
  if (!estado.sesion) {
    estado.gafetes = await llamarApi('/autenticacion/gafetes');
  }
  renderizar();
}

async function enviarAlAgente(mensaje) {
  estado.chat.push({ de: 'usuario', texto: mensaje });
  renderizar();
  try {
    const respuesta = await llamarApi('/agente/mensajes', { metodo: 'POST', cuerpo: { mensaje } });
    estado.chat.push({ de: 'agente', texto: respuesta.respuesta, herramienta: respuesta.herramienta });
  } catch (error) {
    estado.chat.push({ de: 'agente', texto: error.message, herramienta: null });
  }
  renderizar();
}

/* ---------- Clics ---------- */

document.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) {
    return;
  }
  const accion = boton.dataset.accion;

  if (accion === 'elegir-gafete') {
    estado.seleccionadoId = boton.dataset.id;
    renderizar();
    raiz.querySelector('#pin')?.focus();
  }

  if (accion === 'cambiar-vista') {
    estado.vista = boton.dataset.vista;
    renderizar();
  }

  if (accion === 'salir') {
    try {
      await llamarApi('/autenticacion/cerrar', { metodo: 'POST' });
    } catch {
      // La sesión ya no existía en el servidor: igual salimos localmente.
    }
    borrarSesion();
    Object.assign(estado, { sesion: null, seleccionadoId: null, vista: null, chat: [] });
    await iniciar();
  }

  if (accion === 'accion-rapida') {
    await enviarAlAgente(boton.dataset.mensaje);
  }
});

/* ---------- Formularios ---------- */

const MANEJADORES = {
  'iniciar-sesion': async (campos) => {
    const gafete = estado.gafetes.find((g) => g.id === estado.seleccionadoId);
    const sesion = await llamarApi('/autenticacion/iniciar', {
      metodo: 'POST',
      cuerpo: { usuario: gafete.usuario, pin: campos.pin }
    });
    guardarSesion(sesion);
    estado.sesion = sesion;
    estado.vista = vistaInicialPara(sesion.perfil.rol);
    await cargarDatos();
    return `¡Bienvenido, ${sesion.perfil.nombre}! Credencial de ${sesion.perfil.rol} activada.`;
  },
  entregar: async (campos, formulario) => {
    const respuesta = await llamarApi('/entregas', {
      metodo: 'POST',
      cuerpo: { equipoId: formulario.dataset.equipoId, ...campos }
    });
    await cargarDatos();
    return respuesta.mensaje;
  },
  evaluar: async (campos, formulario) => {
    const criterios = {};
    for (const clave of ['innovacion', 'funcionalidad', 'calidadTecnica', 'presentacion']) {
      criterios[clave] = Number(campos[clave]);
    }
    const respuesta = await llamarApi('/evaluaciones', {
      metodo: 'POST',
      cuerpo: { entregaId: formulario.dataset.entregaId, criterios, comentario: campos.comentario }
    });
    await cargarDatos();
    return respuesta.mensaje;
  },
  'crear-equipo': async (campos) => {
    const equipo = await llamarApi('/equipos', { metodo: 'POST', cuerpo: campos });
    await cargarDatos();
    return `Equipo "${equipo.nombre}" creado.`;
  },
  'agregar-integrante': async (campos) => {
    await llamarApi(`/equipos/${campos.equipoId}/integrantes`, {
      metodo: 'POST',
      cuerpo: { usuarioId: campos.usuarioId }
    });
    await cargarDatos();
    return 'Integrante agregado al equipo.';
  },
  'asignar-mentor': async (campos) => {
    await llamarApi(`/equipos/${campos.equipoId}/mentor`, {
      metodo: 'POST',
      cuerpo: { usuarioId: campos.usuarioId }
    });
    await cargarDatos();
    return 'Mentor asignado al equipo.';
  },
  'crear-desafio': async (campos) => {
    const desafio = await llamarApi('/desafios', {
      metodo: 'POST',
      cuerpo: { ...campos, fechaLimite: new Date(campos.fechaLimite).toISOString() }
    });
    await cargarDatos();
    return `Desafío "${desafio.titulo}" publicado.`;
  }
};

document.addEventListener('submit', async (evento) => {
  const formulario = evento.target.closest('[data-formulario]');
  if (!formulario) {
    return;
  }
  evento.preventDefault();
  const campos = Object.fromEntries(new FormData(formulario));

  if (formulario.dataset.formulario === 'chat') {
    formulario.reset();
    await enviarAlAgente(campos.mensaje);
    return;
  }

  const manejador = MANEJADORES[formulario.dataset.formulario];
  try {
    const mensajeExito = await manejador(campos, formulario);
    mostrarMensaje('exito', mensajeExito);
  } catch (error) {
    mostrarMensaje('error', error.message);
  }
});

/* ---------- Detalles vivos ---------- */

// La suma de la rúbrica se actualiza mientras el juez escribe los puntajes.
document.addEventListener('input', (evento) => {
  if (!evento.target.classList.contains('puntaje')) {
    return;
  }
  const formulario = evento.target.closest('form');
  const total = [...formulario.querySelectorAll('.puntaje')].reduce(
    (suma, campo) => suma + (Number(campo.value) || 0),
    0
  );
  formulario.querySelector('[data-total]').textContent = total;
});

// Reloj del evento: las cuentas regresivas avanzan cada segundo.
setInterval(() => {
  for (const elemento of document.querySelectorAll('[data-fecha-limite]')) {
    const restante = new Date(elemento.dataset.fechaLimite).getTime() - Date.now();
    elemento.textContent = formatearCuentaRegresiva(restante);
    elemento.classList.toggle('vencida', restante <= 0);
  }
}, 1000);

iniciar();
