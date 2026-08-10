import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { arrancarServidorDePrueba, llamar, iniciarSesionDePrueba } from './ayudantes.js';

let contexto;

before(async () => {
  contexto = await arrancarServidorDePrueba();
});

after(() => contexto.cerrar());

const CASO_VALIDO = {
  titulo: 'Vida saludable en el campus',
  descripcion: 'Diseñar una herramienta que fomente hábitos saludables entre los estudiantes.',
  detalle: 'Contexto: los estudiantes reportan altos niveles de sedentarismo.\n\nReto: construir una aplicación que registre actividad física y proponga retos semanales.',
  recursos: ['https://github.com/Leaflet/Leaflet'],
  fechaLimite: '2026-11-15T18:00:00-06:00'
};

test('caso exitoso: la organización publica un caso y cualquier rol puede ver su detalle', async () => {
  const tokenOrganizadora = await iniciarSesionDePrueba(contexto.base, 'lucia');
  const publicacion = await llamar(contexto.base, '/desafios', {
    metodo: 'POST',
    token: tokenOrganizadora,
    cuerpo: CASO_VALIDO
  });
  assert.equal(publicacion.estado, 201);

  // Un participante lo ve completo, con detalle y recursos.
  const tokenParticipante = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { cuerpo: desafios } = await llamar(contexto.base, '/desafios', { token: tokenParticipante });
  const publicado = desafios.find((d) => d.id === publicacion.cuerpo.id);
  assert.equal(publicado.titulo, CASO_VALIDO.titulo);
  assert.match(publicado.detalle, /Reto: construir una aplicación/);
  assert.deepEqual(publicado.recursos, CASO_VALIDO.recursos);
  assert.equal(publicado.abierto, true);
});

test('caso de error: un participante no puede publicar casos', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'carlos');
  const { estado } = await llamar(contexto.base, '/desafios', {
    metodo: 'POST',
    token,
    cuerpo: CASO_VALIDO
  });
  assert.equal(estado, 403);
});

test('caso de error: los recursos deben ser enlaces públicos https', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'lucia');
  const { estado, cuerpo } = await llamar(contexto.base, '/desafios', {
    metodo: 'POST',
    token,
    cuerpo: { ...CASO_VALIDO, recursos: ['ftp://servidor/archivo'] }
  });
  assert.equal(estado, 400);
  assert.match(cuerpo.error, /https/);
});

test('caso límite: se aceptan exactamente 5 recursos y se rechaza el sexto', async () => {
  const token = await iniciarSesionDePrueba(contexto.base, 'lucia');
  const enlace = 'https://github.com/Leaflet/Leaflet';

  const conCinco = await llamar(contexto.base, '/desafios', {
    metodo: 'POST',
    token,
    cuerpo: { ...CASO_VALIDO, recursos: Array(5).fill(enlace) }
  });
  assert.equal(conCinco.estado, 201);

  const conSeis = await llamar(contexto.base, '/desafios', {
    metodo: 'POST',
    token,
    cuerpo: { ...CASO_VALIDO, recursos: Array(6).fill(enlace) }
  });
  assert.equal(conSeis.estado, 400);
  assert.match(conSeis.cuerpo.error, /máximo 5/);
});
