import { test } from 'node:test';
import assert from 'node:assert/strict';
import { procesarMensaje } from '../src/agente/motor.js';
import { detectorPlagio } from '../src/agente/herramientas/detectorPlagio.js';

const DATOS_BASE = {
  configuracion: { nombreEvento: 'Hackathon de Prueba' },
  usuarios: [],
  equipos: [
    { id: 'e1', nombre: 'Alfa', desafioId: 'd1', integrantesIds: ['u1'] },
    { id: 'e2', nombre: 'Beta', desafioId: 'd1', integrantesIds: ['u2'] }
  ],
  desafios: [{ id: 'd1', titulo: 'Desafío', fechaLimite: '2026-12-01T18:00:00-06:00' }],
  entregas: [],
  evaluaciones: [],
  documentacion: []
};

const PARTICIPANTE = { id: 'u1', nombre: 'Prueba', rol: 'participante' };
const JUEZ = { id: 'u9', nombre: 'Juez', rol: 'juez' };

test('el agente se niega a escribir código para los participantes', () => {
  const respuesta = procesarMensaje(DATOS_BASE, PARTICIPANTE, 'escribe el código de mi proyecto');
  assert.equal(respuesta.herramienta, null);
  assert.match(respuesta.respuesta, /no puedo escribir ni corregir/);
});

test('el detector de plagio está restringido a jueces y organización', () => {
  const denegado = procesarMensaje(DATOS_BASE, PARTICIPANTE, '¿hay plagio en las entregas?');
  assert.equal(denegado.herramienta, null);
  assert.match(denegado.respuesta, /solo está disponible/);

  const permitido = procesarMensaje(DATOS_BASE, JUEZ, '¿hay plagio en las entregas?');
  assert.equal(permitido.herramienta, 'detector_plagio');
});

test('el detector solo marca fragmentos exactos y presenta la evidencia', () => {
  const textoCopiado = 'sistema de monitoreo de rutas de bus con sensores de posición en tiempo real';
  const datos = {
    ...DATOS_BASE,
    entregas: [
      {
        equipoId: 'e1',
        urlRepositorio: 'https://github.com/alfa/proyecto',
        descripcion: `Construimos un ${textoCopiado} para el campus central.`
      },
      {
        equipoId: 'e2',
        urlRepositorio: 'https://github.com/beta/proyecto',
        descripcion: `Nuestro equipo hizo un ${textoCopiado} y un panel administrativo.`
      }
    ]
  };
  const resultado = detectorPlagio(datos);
  assert.equal(resultado.totalCoincidencias, 1);
  assert.deepEqual(resultado.coincidencias[0].equipos, ['Alfa', 'Beta']);
  assert.match(resultado.coincidencias[0].evidencia, /sistema de monitoreo de rutas/);
});

test('el detector no marca nada cuando las descripciones son distintas', () => {
  const datos = {
    ...DATOS_BASE,
    entregas: [
      {
        equipoId: 'e1',
        urlRepositorio: 'https://github.com/alfa/proyecto',
        descripcion: 'Aplicación de rutas compartidas para estudiantes con mapa interactivo.'
      },
      {
        equipoId: 'e2',
        urlRepositorio: 'https://github.com/beta/proyecto',
        descripcion: 'Panel de clasificación de residuos con reportes semanales por edificio.'
      }
    ]
  };
  assert.equal(detectorPlagio(datos).totalCoincidencias, 0);
});
