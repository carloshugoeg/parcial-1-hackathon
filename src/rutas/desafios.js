import { Router } from 'express';
import { autenticar, requerirRol } from '../auth/sesiones.js';
import { obtenerDatos, guardarDatos, crearId } from '../datos/almacen.js';
import { validarTexto, validarFechaIso } from '../utils/validaciones.js';

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

rutas.post('/', autenticar, requerirRol('organizador'), (req, res) => {
  const datos = obtenerDatos();
  const desafio = {
    id: crearId('d'),
    titulo: validarTexto(req.body?.titulo, 'titulo', { min: 5, max: 80 }),
    descripcion: validarTexto(req.body?.descripcion, 'descripcion', { min: 20, max: 500 }),
    fechaLimite: validarFechaIso(req.body?.fechaLimite, 'fechaLimite')
  };
  datos.desafios.push(desafio);
  guardarDatos();
  res.status(201).json(desafio);
});

export default rutas;
