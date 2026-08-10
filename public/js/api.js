// Cliente HTTP mínimo: agrega el token de sesión y convierte los errores
// de la API en excepciones con el mensaje que escribió el servidor.
const CLAVE_SESION = 'hackathon-url-sesion';

export function obtenerSesion() {
  const guardada = localStorage.getItem(CLAVE_SESION);
  return guardada ? JSON.parse(guardada) : null;
}

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

export async function llamarApi(ruta, { metodo = 'GET', cuerpo } = {}) {
  const sesion = obtenerSesion();
  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error ?? 'No se pudo completar la operación.');
    error.codigoHttp = respuesta.status;
    throw error;
  }
  return datos;
}
