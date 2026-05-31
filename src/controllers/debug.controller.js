const { getRow } = require('../db');

// VULNERABLE: ruta de "debug" que expone datos sensibles del usuario
// y de la sesión. Es Sensitive Data Exposure. En main-secure se elimina.
exports.index = (req, res) => {
  const user = getRow('SELECT * FROM users WHERE id = ?', [req.session.userId]);

  // "Token" simulado para la captura. No es un secreto real del sistema,
  // solo una representación visible del session id.
  const fakeSessionToken =
    'sess_' + Buffer.from(req.sessionID || '').toString('hex').slice(0, 32);

  res.render('debug/index', {
    title: 'Debug',
    user,
    sessionId: req.sessionID,
    sessionData: req.session,
    fakeSessionToken,
    appInfo: {
      version: '0.1.0-vulnerable',
      mode: 'development',
      node: process.version,
      platform: process.platform,
      uptimeSec: Math.round(process.uptime())
    }
  });
};

// VULNERABLE: ruta que fuerza un error para demostrar Security
// Misconfiguration en el manejador global (stack trace al usuario).
exports.triggerError = (req, res, next) => {
  next(new Error('Error de prueba forzado desde /debug/error'));
};
