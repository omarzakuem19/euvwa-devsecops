const { exec } = require('../db');

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: la query se construye concatenando strings con la entrada del usuario.
  // Permite SQL Injection. En main-secure se usará una sentencia preparada con parámetros.
  const query =
    "SELECT * FROM users WHERE username = '" + username +
    "' AND password = '" + password + "'";

  let rows;
  try {
    rows = exec(query);
  } catch (err) {
    return res.render('auth/login', {
      title: 'Login',
      error: 'Error en la consulta: ' + err.message
    });
  }

  if (!rows.length) {
    return res.render('auth/login', {
      title: 'Login',
      error: 'Credenciales inválidas.'
    });
  }

  const user = rows[0];
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/profile');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
