// Error controlado: su mensaje es seguro para mostrarse al usuario final.
export class ErrorDeSolicitud extends Error {
  constructor(mensaje, codigoHttp = 400) {
    super(mensaje);
    this.codigoHttp = codigoHttp;
  }
}

export function manejarErrores(error, _req, res, _next) {
  if (error instanceof ErrorDeSolicitud) {
    return res.status(error.codigoHttp).json({ error: error.message });
  }
  console.error('Error no controlado:', error);
  return res.status(500).json({ error: 'Ocurrió un error interno. Intente de nuevo.' });
}
