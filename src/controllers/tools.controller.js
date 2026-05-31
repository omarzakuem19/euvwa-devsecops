const { execFile } = require('child_process');

// Validación simple de host: IPv4 o nombre de dominio razonable.
function isValidHost(host) {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) {
    return false;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return host.split('.').every(n => {
      const v = parseInt(n, 10);
      return v >= 0 && v <= 255;
    });
  }
  // Nombre de dominio: letras, números, guiones y puntos. Sin espacios
  // ni metacaracteres de shell.
  const labelRe = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
  return host.split('.').every(label => labelRe.test(label));
}

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

  if (!isValidHost(host)) {
    return res.render('tools/ping', {
      title: 'Ping',
      host,
      output: null,
      error: 'Host no válido. Solo se aceptan IPv4 o nombres de dominio.'
    });
  }

  // execFile no pasa por la shell: los argumentos son literales y los
  // separadores como '&' o ';' no se interpretan.
  const args = process.platform === 'win32' ? ['-n', '2', host] : ['-c', '2', host];

  execFile('ping', args, { timeout: 5000 }, (err, stdout, stderr) => {
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
