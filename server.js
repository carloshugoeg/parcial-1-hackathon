import { inicializarAlmacen } from './src/datos/almacen.js';
import { crearApp } from './src/app.js';

const PUERTO = process.env.PUERTO || 3000;

inicializarAlmacen();
crearApp().listen(PUERTO, () => {
  console.log(`Hackathon URL corriendo en http://localhost:${PUERTO}`);
});
