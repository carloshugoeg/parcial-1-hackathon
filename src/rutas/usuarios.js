import { Router } from 'express';
import { autenticar, requerirRol, perfilPublico } from '../auth/sesiones.js';
import { obtenerDatos } from '../datos/almacen.js';

const rutas = Router();

// La organización necesita el listado para armar equipos y asignar mentores.
rutas.get('/', autenticar, requerirRol('organizador'), (req, res) => {
  const datos = obtenerDatos();
  const usuarios = datos.usuarios.map((usuario) => ({
    ...perfilPublico(usuario),
    equipo: datos.equipos.find((e) => e.integrantesIds.includes(usuario.id))?.nombre ?? null
  }));
  res.json(usuarios);
});

export default rutas;
