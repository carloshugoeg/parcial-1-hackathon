import { Router } from 'express';
import { autenticar, requerirRol } from '../auth/sesiones.js';
import { obtenerDatos, guardarDatos } from '../datos/almacen.js';
import { registrarEntrega, listarEntregasPara } from '../servicios/entregas.js';

const rutas = Router();

rutas.get('/', autenticar, (req, res) => {
  res.json(listarEntregasPara(obtenerDatos(), req.usuario));
});

rutas.post('/', autenticar, requerirRol('participante'), (req, res) => {
  const { equipoId, urlRepositorio, descripcion } = req.body ?? {};
  const resultado = registrarEntrega(obtenerDatos(), {
    equipoId,
    usuario: req.usuario,
    urlRepositorio,
    descripcion
  });
  guardarDatos();
  res.status(201).json({
    mensaje: resultado.reemplazo
      ? 'La entrega anterior del equipo fue reemplazada con éxito.'
      : 'Entrega registrada con éxito.',
    entrega: resultado.entrega
  });
});

export default rutas;
