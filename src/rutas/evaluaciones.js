import { Router } from 'express';
import { autenticar, requerirRol } from '../auth/sesiones.js';
import { obtenerDatos, guardarDatos } from '../datos/almacen.js';
import { registrarEvaluacion, CRITERIOS_RUBRICA, PUNTAJE_MAXIMO_POR_CRITERIO } from '../servicios/evaluaciones.js';

const rutas = Router();

rutas.get('/rubrica', autenticar, (req, res) => {
  res.json({ criterios: CRITERIOS_RUBRICA, puntajeMaximoPorCriterio: PUNTAJE_MAXIMO_POR_CRITERIO });
});

rutas.post('/', autenticar, requerirRol('juez'), (req, res) => {
  const { entregaId, criterios, comentario } = req.body ?? {};
  const evaluacion = registrarEvaluacion(obtenerDatos(), {
    entregaId,
    juez: req.usuario,
    criterios,
    comentario
  });
  guardarDatos();
  res.status(201).json({ mensaje: `Evaluación registrada. Nota: ${evaluacion.total}/100.`, evaluacion });
});

export default rutas;
