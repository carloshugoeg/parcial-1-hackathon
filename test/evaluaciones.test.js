import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { arrancarServidorDePrueba, llamar, iniciarSesionDePrueba } from './ayudantes.js';

let contexto;

before(async () => {
  contexto = await arrancarServidorDePrueba();
});

after(() => contexto.cerrar());

function evaluacion(criterios) {
  return { entregaId: 'n1', criterios, comentario: 'Comentario de prueba para el equipo.' };
}

test('caso exitoso: el juez evalúa con la rúbrica y la nota se suma automáticamente', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'ernesto');
  const { estado, cuerpo } = await llamar(contexto.base, '/evaluaciones', {
    metodo: 'POST',
    token,
    cuerpo: evaluacion({ innovacion: 20, funcionalidad: 22, calidadTecnica: 18, presentacion: 21 })
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.evaluacion.total, 81);
});

test('caso de error: un participante no puede registrar evaluaciones', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { estado, cuerpo } = await llamar(contexto.base, '/evaluaciones', {
    metodo: 'POST',
    token,
    cuerpo: evaluacion({ innovacion: 10, funcionalidad: 10, calidadTecnica: 10, presentacion: 10 })
  });
  assert.equal(estado, 403);
  assert.match(cuerpo.error, /solo está disponible para el rol: juez/);
});

test('caso de error: un puntaje fuera de la rúbrica se rechaza con mensaje claro', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'silvia');
  const { estado, cuerpo } = await llamar(contexto.base, '/evaluaciones', {
    metodo: 'POST',
    token,
    cuerpo: evaluacion({ innovacion: 26, funcionalidad: 10, calidadTecnica: 10, presentacion: 10 })
  });
  assert.equal(estado, 400);
  assert.match(cuerpo.error, /entre 0 y 25/);
});

test('caso límite: los puntajes en los bordes de la rúbrica (0 y 25) se aceptan', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'silvia');
  const { estado, cuerpo } = await llamar(contexto.base, '/evaluaciones', {
    metodo: 'POST',
    token,
    cuerpo: evaluacion({ innovacion: 0, funcionalidad: 25, calidadTecnica: 0, presentacion: 25 })
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.evaluacion.total, 50);
});

test('caso de error: el mismo juez no puede evaluar dos veces la misma entrega', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'ernesto');
  const { estado, cuerpo } = await llamar(contexto.base, '/evaluaciones', {
    metodo: 'POST',
    token,
    cuerpo: evaluacion({ innovacion: 5, funcionalidad: 5, calidadTecnica: 5, presentacion: 5 })
  });
  assert.equal(estado, 409);
  assert.match(cuerpo.error, /ya registró una evaluación/i);
});
