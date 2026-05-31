const { exec } = require('child_process');

exports.ping = (req, res) => {
  const host = req.query.host || '';

  if (!host) {
    return res.render('tools/ping', {
      title: 'Ping',
      host: '',
      output: null,
      error: null
    });
  }

  // Número de paquetes según el sistema operativo (-n en Windows, -c en Unix).
  const countFlag = process.platform === 'win32' ? '-n 2' : '-c 2';

  // VULNERABLE: el host se concatena directamente en el comando que se
  // ejecuta a través de la shell (cmd en Windows, sh en Linux/macOS).
  // Permite Command Injection con separadores como '&' o ';'.
  // En main-secure se usará execFile con argumentos separados y validación.
  const command = 'ping ' + countFlag + ' ' + host;

  exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
    let output = '';
    if (stdout) output += stdout;
    if (stderr) output += stderr;

    let error = null;
    if (err && err.killed) {
      error = 'El comando ha excedido el tiempo límite.';
    }

    res.render('tools/ping', {
      title: 'Ping',
      host,
      output: output || '(sin salida)',
      error
    });
  });
};
