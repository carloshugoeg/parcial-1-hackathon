import crypto from 'node:crypto';
import { ErrorDeSolicitud } from '../utils/errores.js';
import { obtenerDatos } from '../datos/almacen.js';

// Sesiones en memoria: suficiente para el alcance del evento (un solo servidor).
const sesionesActivas = new Map();

export function perfilPublico(usuario) {
  return { id: usuario.id, usuario: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol };
}

export function iniciarSesion(nombreDeUsuario, pin) {
  const datos = obtenerDatos();
  const usuario = datos.usuarios.find(
    (u) => u.usuario === String(nombreDeUsuario).trim().toLowerCase() && u.pin === String(pin)
  );
  if (!usuario) {
    throw new ErrorDeSolicitud('Usuario o PIN incorrectos.', 401);
  }
  const token = crypto.randomBytes(24).toString('hex');
  sesionesActivas.set(token, usuario.id);
  return { token, perfil: perfilPublico(usuario) };
}

export function cerrarSesion(token) {
  sesionesActivas.delete(token);
}

export function autenticar(req, _res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const usuarioId = sesionesActivas.get(token);
  const usuario = usuarioId && obtenerDatos().usuarios.find((u) => u.id === usuarioId);
  if (!usuario) {
    throw new ErrorDeSolicitud('Sesión no válida. Inicie sesión de nuevo.', 401);
  }
  req.usuario = usuario;
  req.token = token;
  next();
}

export function requerirRol(...rolesPermitidos) {
  return (req, _res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new ErrorDeSolicitud(
        `Esta acción solo está disponible para el rol: ${rolesPermitidos.join(', ')}.`,
        403
      );
    }
    next();
  };
}
