import { Router } from 'express';
import { autenticar } from '../auth/sesiones.js';
import { obtenerDatos } from '../datos/almacen.js';
import { procesarMensaje } from '../agente/motor.js';

const rutas = Router();

rutas.post('/mensajes', autenticar, (req, res) => {
  res.json(procesarMensaje(obtenerDatos(), req.usuario, req.body?.mensaje));
});

export default rutas;
