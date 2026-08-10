import { Router } from 'express';
import { autenticar, requerirRol } from '../auth/sesiones.js';
import { obtenerDatos, guardarDatos, crearId } from '../datos/almacen.js';
import { ErrorDeSolicitud } from '../utils/errores.js';
import { validarTexto, validarFechaIso, validarUrlPublica } from '../utils/validaciones.js';

const MAXIMO_RECURSOS = 5;

const rutas = Router();

rutas.get('/', autenticar, (req, res) => {
  const datos = obtenerDatos();
  const ahora = Date.now();
  res.json(
    datos.desafios.map((desafio) => ({
      ...desafio,
      abierto: ahora <= new Date(desafio.fechaLimite).getTime(),
      equipos: datos.equipos.filter((e) => e.desafioId === desafio.id).map((e) => e.nombre)
    }))
  );
});

// La organización publica el caso completo: resumen, enunciado detallado,
// recursos de apoyo (enlaces públicos) y fecha límite. Todos los roles lo ven.
rutas.post('/', autenticar, requerirRol('organizador'), (req, res) => {
  const datos = obtenerDatos();
  const recursos = req.body?.recursos ?? [];
  if (!Array.isArray(recursos) || recursos.length > MAXIMO_RECURSOS) {
    throw new ErrorDeSolicitud(`Los recursos deben ser una lista de máximo ${MAXIMO_RECURSOS} enlaces.`);
  }
  const desafio = {
    id: crearId('d'),
    titulo: validarTexto(req.body?.titulo, 'titulo', { min: 5, max: 80 }),
    descripcion: validarTexto(req.body?.descripcion, 'descripcion', { min: 20, max: 500 }),
    detalle: validarTexto(req.body?.detalle, 'detalle', { min: 30, max: 2000 }),
    recursos: recursos.map((url) => validarUrlPublica(url, 'recursos')),
    fechaLimite: validarFechaIso(req.body?.fechaLimite, 'fechaLimite')
  };
  datos.desafios.push(desafio);
  guardarDatos();
  res.status(201).json(desafio);
});

export default rutas;
