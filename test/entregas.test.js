import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { arrancarServidorDePrueba, llamar, iniciarSesionDePrueba } from './ayudantes.js';

let contexto;

before(async () => {
  contexto = await arrancarServidorDePrueba();
});

after(() => contexto.cerrar());

const ENTREGA_VALIDA = {
  equipoId: 'e1',
  urlRepositorio: 'https://github.com/los-compiladores/movilidad-url',
  descripcion: 'Plataforma de rutas compartidas con mapa del campus y avisos de bus en tiempo real.'
};

test('caso exitoso: un integrante registra la entrega de su equipo antes del límite', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { estado, cuerpo } = await llamar(contexto.base, '/entregas', {
    metodo: 'POST',
    token,
    cuerpo: ENTREGA_VALIDA
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.entrega.equipoId, 'e1');
  assert.match(cuerpo.mensaje, /éxito/);
});

test('caso de error: nadie puede entregar por un equipo al que no pertenece', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { estado, cuerpo } = await llamar(contexto.base, '/entregas', {
    metodo: 'POST',
    token,
    cuerpo: { ...ENTREGA_VALIDA, equipoId: 'e2' }
  });
  assert.equal(estado, 403);
  assert.match(cuerpo.error, /integrantes de "Bit a Bit"/);
});

test('caso de error: la URL del repositorio debe ser de GitHub', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { estado, cuerpo } = await llamar(contexto.base, '/entregas', {
    metodo: 'POST',
    token,
    cuerpo: { ...ENTREGA_VALIDA, urlRepositorio: 'ftp://sitio-raro/repo' }
  });
  assert.equal(estado, 400);
  assert.match(cuerpo.error, /github\.com/);
});

test('caso límite: la entrega exactamente a la hora límite se acepta, un segundo después se rechaza', async () => {
  const { registrarEntrega } = await import('../src/servicios/entregas.js');
  const fechaLimite = '2026-12-01T18:00:00-06:00';
  const crearDatos = () => ({
    equipos: [{ id: 'e1', nombre: 'Equipo Límite', desafioId: 'd1', integrantesIds: ['u5'] }],
    desafios: [{ id: 'd1', titulo: 'Desafío Límite', fechaLimite }],
    entregas: []
  });
  const usuario = { id: 'u5' };
  const entrega = {
    equipoId: 'e1',
    usuario,
    urlRepositorio: 'https://github.com/equipo/proyecto',
    descripcion: 'Descripción suficientemente larga para la validación.'
  };

  // Exactamente a la hora límite: se acepta (la regla es "inclusive").
  const resultado = registrarEntrega(crearDatos(), { ...entrega, ahora: new Date(fechaLimite) });
  assert.equal(resultado.reemplazo, false);

  // Un segundo después: se rechaza con un mensaje claro.
  assert.throws(
    () =>
      registrarEntrega(crearDatos(), {
        ...entrega,
        ahora: new Date(new Date(fechaLimite).getTime() + 1000)
      }),
    /fecha límite .* ya pasó/
  );
});
