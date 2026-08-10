import express from 'express';
import { manejarErrores } from './utils/errores.js';
import rutasAutenticacion from './rutas/autenticacion.js';
import rutasUsuarios from './rutas/usuarios.js';
import rutasEquipos from './rutas/equipos.js';
import rutasDesafios from './rutas/desafios.js';
import rutasEntregas from './rutas/entregas.js';
import rutasEvaluaciones from './rutas/evaluaciones.js';
import rutasAgente from './rutas/agente.js';

export function crearApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static('public'));

  app.use('/api/autenticacion', rutasAutenticacion);
  app.use('/api/usuarios', rutasUsuarios);
  app.use('/api/equipos', rutasEquipos);
  app.use('/api/desafios', rutasDesafios);
  app.use('/api/entregas', rutasEntregas);
  app.use('/api/evaluaciones', rutasEvaluaciones);
  app.use('/api/agente', rutasAgente);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'El recurso solicitado no existe.' });
  });
  app.use(manejarErrores);
  return app;
}
