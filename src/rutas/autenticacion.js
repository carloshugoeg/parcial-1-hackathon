import { Router } from 'express';
import { iniciarSesion, cerrarSesion, autenticar, perfilPublico } from '../auth/sesiones.js';
import { obtenerDatos } from '../datos/almacen.js';

const rutas = Router();

// Mesa de registro: lista pública de gafetes (sin PIN) para elegir con quién entrar.
rutas.get('/gafetes', (_req, res) => {
  res.json(obtenerDatos().usuarios.map(perfilPublico));
});

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
