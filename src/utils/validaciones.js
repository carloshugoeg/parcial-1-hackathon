import { ErrorDeSolicitud } from './errores.js';

const PATRON_URL_GITHUB = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export function validarTexto(valor, nombreCampo, { min = 1, max = 500 } = {}) {
  if (typeof valor !== 'string' || valor.trim().length < min) {
    throw new ErrorDeSolicitud(`El campo "${nombreCampo}" es obligatorio (mínimo ${min} caracteres).`);
  }
  if (valor.trim().length > max) {
    throw new ErrorDeSolicitud(`El campo "${nombreCampo}" no puede superar ${max} caracteres.`);
  }
  return valor.trim();
}

export function validarUrlDeRepositorio(url) {
  const urlLimpia = validarTexto(url, 'urlRepositorio');
  if (!PATRON_URL_GITHUB.test(urlLimpia)) {
    throw new ErrorDeSolicitud(
      'La URL del repositorio debe tener el formato https://github.com/usuario/repositorio.'
    );
  }
  return urlLimpia;
}

export function validarEnteroEnRango(valor, nombreCampo, min, max) {
  if (!Number.isInteger(valor) || valor < min || valor > max) {
    throw new ErrorDeSolicitud(
      `El campo "${nombreCampo}" debe ser un número entero entre ${min} y ${max}.`
    );
  }
  return valor;
}

export function validarFechaIso(valor, nombreCampo) {
  const fecha = new Date(validarTexto(valor, nombreCampo, { max: 40 }));
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorDeSolicitud(`El campo "${nombreCampo}" debe ser una fecha válida en formato ISO.`);
  }
  return fecha.toISOString();
}
