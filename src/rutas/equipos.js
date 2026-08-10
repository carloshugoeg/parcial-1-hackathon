import { Router } from 'express';
import { autenticar, requerirRol } from '../auth/sesiones.js';
import { obtenerDatos, guardarDatos } from '../datos/almacen.js';
import { crearEquipo, agregarIntegrante, asignarMentor, listarEquipos } from '../servicios/equipos.js';

const rutas = Router();

rutas.get('/', autenticar, (req, res) => {
  res.json(listarEquipos(obtenerDatos()));
});

rutas.post('/', autenticar, requerirRol('organizador'), (req, res) => {
  const { nombre, desafioId } = req.body ?? {};
  const equipo = crearEquipo(obtenerDatos(), { nombre, desafioId });
  guardarDatos();
  res.status(201).json(equipo);
});

rutas.post('/:id/integrantes', autenticar, requerirRol('organizador'), (req, res) => {
  const equipo = agregarIntegrante(obtenerDatos(), {
    equipoId: req.params.id,
    usuarioId: req.body?.usuarioId
  });
  guardarDatos();
  res.status(201).json(equipo);
});

rutas.post('/:id/mentor', autenticar, requerirRol('organizador'), (req, res) => {
  const equipo = asignarMentor(obtenerDatos(), {
    equipoId: req.params.id,
    usuarioId: req.body?.usuarioId
  });
  guardarDatos();
  res.json(equipo);
});

export default rutas;
