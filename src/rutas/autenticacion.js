import { Router } from 'express';
import { iniciarSesion, cerrarSesion, autenticar, perfilPublico } from '../auth/sesiones.js';

const rutas = Router();

rutas.post('/iniciar', (req, res) => {
  const { usuario, pin } = req.body ?? {};
  res.json(iniciarSesion(usuario, pin));
});

rutas.post('/cerrar', autenticar, (req, res) => {
  cerrarSesion(req.token);
  res.json({ mensaje: 'Sesión cerrada.' });
});

rutas.get('/perfil', autenticar, (req, res) => {
  res.json(perfilPublico(req.usuario));
});

export default rutas;
