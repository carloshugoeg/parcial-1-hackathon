import { validarTexto } from '../utils/validaciones.js';
import { normalizarTexto, contieneAlguna } from './texto.js';
import { recordatorioTiempo } from './herramientas/recordatorioTiempo.js';
import { detectorPlagio } from './herramientas/detectorPlagio.js';
import { estadoEntregas } from './herramientas/estadoEntregas.js';
import { consultaDocumentacion } from './herramientas/consultaDocumentacion.js';

// El agente sigue el prompt diseñado en la Serie II: es un miembro más del
// staff del evento. Reglas: no escribe código de los participantes, no responde
// fuera de la documentación y el detector de plagio solo presenta evidencia.
const PALABRAS_CODIGO = ['codigo', 'programa', 'funcion', 'bug', 'implementa', 'implementar', 'escribe', 'hazme', 'resuelveme', 'programar'];
const PALABRAS_PLAGIO = ['plagio', 'copia', 'copiado', 'copiaron', 'similitud', 'parecido'];
const PALABRAS_TIEMPO = ['tiempo', 'falta', 'limite', 'plazo', 'deadline', 'cierra', 'queda'];
const PALABRAS_ESTADO = ['estado', 'entregas', 'entregado', 'entregaron', 'avance', 'resumen', 'quienes'];
const PALABRAS_SALUDO = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'ayuda'];

function capacidadesPara(rol) {
  const comunes = [
    'preguntarme por el tiempo restante de los desafíos',
    'consultar la documentación del evento (reglas, entregas, rúbrica, agenda)'
  ];
  if (rol === 'juez' || rol === 'organizador') {
    return [...comunes, 'pedir el estado de entregas de los equipos', 'ejecutar el detector de plagio'];
  }
  if (rol === 'mentor') {
    return [...comunes, 'pedir el estado de entregas de tus equipos'];
  }
  return [...comunes, 'consultar el estado de entrega de tu equipo'];
}

function respuestaDeAlcance(usuario) {
  const capacidades = capacidadesPara(usuario.rol).map((c) => `• ${c}`).join('\n');
  return {
    respuesta: `Solo puedo apoyar con temas documentados del evento. Como ${usuario.rol} puedes:\n${capacidades}`,
    herramienta: null
  };
}

export function procesarMensaje(datos, usuario, mensaje) {
  const mensajeLimpio = validarTexto(mensaje, 'mensaje', { max: 300 });
  const texto = normalizarTexto(mensajeLimpio);

  if (usuario.rol === 'participante' && contieneAlguna(texto, PALABRAS_CODIGO)) {
    return {
      respuesta:
        'Como agente del evento no puedo escribir ni corregir el código de los participantes: esa es responsabilidad de tu equipo. Sí puedo recordarte el tiempo restante o aclarar dudas de la documentación.',
      herramienta: null
    };
  }

  if (contieneAlguna(texto, PALABRAS_PLAGIO)) {
    if (usuario.rol !== 'juez' && usuario.rol !== 'organizador') {
      return {
        respuesta: 'El detector de plagio solo está disponible para los jueces y la organización.',
        herramienta: null
      };
    }
    const resultado = detectorPlagio(datos);
    const encabezado =
      resultado.totalCoincidencias === 0
        ? 'Ejecuté el detector de plagio: no encontré coincidencias exactas entre las entregas.'
        : `Ejecuté el detector de plagio y encontré ${resultado.totalCoincidencias} coincidencia(s) exacta(s). La decisión de descontar puntos es del juez:`;
    const detalle = resultado.coincidencias
      .map((c) => `• ${c.equipos.join(' y ')} — ${c.tipo}: ${c.evidencia}`)
      .join('\n');
    return {
      respuesta: detalle ? `${encabezado}\n${detalle}` : encabezado,
      herramienta: 'detector_plagio',
      resultado
    };
  }

  if (contieneAlguna(texto, PALABRAS_TIEMPO)) {
    const resultado = recordatorioTiempo(datos, usuario);
    return {
      respuesta: `Estos son los plazos vigentes:\n${resultado.lineas.map((l) => `• ${l}`).join('\n')}`,
      herramienta: 'recordatorio_tiempo',
      resultado
    };
  }

  if (contieneAlguna(texto, PALABRAS_ESTADO)) {
    const resultado = estadoEntregas(datos, usuario);
    return {
      respuesta: `Estado de entregas:\n${resultado.lineas.map((l) => `• ${l}`).join('\n')}`,
      herramienta: 'estado_entregas',
      resultado
    };
  }

  const documento = consultaDocumentacion(datos, mensajeLimpio);
  if (documento) {
    return {
      respuesta: `Según la documentación oficial (${documento.tema}): ${documento.contenido}`,
      herramienta: 'consulta_documentacion',
      resultado: documento
    };
  }

  if (contieneAlguna(texto, PALABRAS_SALUDO)) {
    return {
      respuesta: `¡Hola, ${usuario.nombre}! Soy el agente del ${datos.configuracion.nombreEvento}. ${respuestaDeAlcance(usuario).respuesta}`,
      herramienta: null
    };
  }

  return respuestaDeAlcance(usuario);
}
