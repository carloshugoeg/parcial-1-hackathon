import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Cada archivo de prueba corre en su propio proceso, con una copia temporal
// de la semilla: las pruebas nunca tocan los datos reales del evento.
export async function arrancarServidorDePrueba() {
  const rutaTemporal = path.join(os.tmpdir(), `hackathon-prueba-${process.pid}-${Date.now()}.json`);
  fs.copyFileSync(path.resolve('data/semilla.json'), rutaTemporal);
  process.env.RUTA_DATOS = rutaTemporal;

  const { inicializarAlmacen } = await import('../src/datos/almacen.js');
  const { crearApp } = await import('../src/app.js');
  inicializarAlmacen();

  const servidor = crearApp().listen(0);
  await new Promise((resolver) => servidor.once('listening', resolver));
  const base = `http://localhost:${servidor.address().port}`;

  return {
    base,
    cerrar: () => {
      servidor.close();
      fs.rmSync(rutaTemporal, { force: true });
    }
  };
}

export async function llamar(base, ruta, { metodo = 'GET', token, cuerpo } = {}) {
  const respuesta = await fetch(`${base}/api${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  return { estado: respuesta.status, cuerpo: await respuesta.json() };
}

export async function iniciarSesionDePrueba(base, usuario) {
  const { cuerpo } = await llamar(base, '/autenticacion/iniciar', {
    metodo: 'POST',
    cuerpo: { usuario, pin: '1234' }
  });
  return cuerpo.token;
}
