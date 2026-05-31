const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const { getRow } = require('../db');

// Rate limit básico para frenar fuerza bruta sobre el login.
exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos de login. Espera un minuto.'
});

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.render('auth/login', {
      title: 'Login',
      error: 'Credenciales inválidas.'
    });
  }

  // Consulta parametrizada: el usuario nunca se concatena en el SQL.
  const user = getRow(
    'SELECT id, username, password, role FROM users WHERE username = ?',
    [username]
  );

  // Comprobación uniforme para no revelar si el usuario existe.
  let ok = false;
  if (user) {
    ok = await bcrypt.compare(password, user.password);
  }

  if (!user || !ok) {
    return res.render('auth/login', {
      title: 'Login',
      error: 'Credenciales inválidas.'
    });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  res.redirect('/profile');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
