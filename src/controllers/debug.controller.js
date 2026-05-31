// Página de diagnóstico mínima. Solo se monta tras requireAuth + requireAdmin
// en el router, así que aquí no hace falta repetir las comprobaciones.
exports.index = (req, res) => {
  res.render('debug/index', {
    title: 'Debug',
    info: {
      version: '0.1.0-secure',
      mode: process.env.NODE_ENV || 'development',
      node: process.version,
      platform: process.platform,
      uptimeSec: Math.round(process.uptime())
    }
  });
};

// Sigue existiendo para poder demostrar el manejador de errores genérico,
// pero ya no devuelve stack trace al cliente (lo gestiona app.js).
exports.triggerError = (req, res, next) => {
  next(new Error('Error de prueba forzado desde /debug/error'));
};
