import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// La ruta puede sobreescribirse en pruebas para no tocar los datos reales.
const RUTA_SEMILLA = path.resolve('data/semilla.json');
const rutaDatos = process.env.RUTA_DATOS ? path.resolve(process.env.RUTA_DATOS) : path.resolve('data/datos.json');

let datosEnMemoria = null;

export function inicializarAlmacen() {
  if (!fs.existsSync(rutaDatos)) {
    fs.mkdirSync(path.dirname(rutaDatos), { recursive: true });
    fs.copyFileSync(RUTA_SEMILLA, rutaDatos);
  }
  datosEnMemoria = JSON.parse(fs.readFileSync(rutaDatos, 'utf8'));
  return datosEnMemoria;
}

export function obtenerDatos() {
  if (!datosEnMemoria) {
    inicializarAlmacen();
  }
  return datosEnMemoria;
}

export function guardarDatos() {
  fs.writeFileSync(rutaDatos, JSON.stringify(datosEnMemoria, null, 2));
}

export function crearId(prefijo) {
  return `${prefijo}-${crypto.randomUUID().slice(0, 8)}`;
}
