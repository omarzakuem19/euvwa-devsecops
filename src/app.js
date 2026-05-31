const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const searchRoutes = require('./routes/search.routes');
const guestbookRoutes = require('./routes/guestbook.routes');
const toolsRoutes = require('./routes/tools.routes');
const usersRoutes = require('./routes/users.routes');
const debugRoutes = require('./routes/debug.routes');

const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// VULNERABLE: no se llama a app.disable('x-powered-by'), así que la cabecera
// X-Powered-By: Express se envía en cada respuesta. Es Security Misconfiguration.

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Servir los avatares subidos. VULNERABLE: cualquier archivo subido al
// directorio uploads/ queda accesible públicamente desde /uploads/<archivo>
// con el Content-Type que express.static infiera de la extensión.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Sesión en memoria. VULNERABLE en varios sentidos a propósito:
//  - secret hardcodeado en el código fuente,
//  - cookie sin httpOnly (un XSS puede leer document.cookie),
//  - sin Secure ni SameSite estricto.
// Esto soporta a la vez Broken Authentication y Security Misconfiguration.
app.use(session({
  secret: 'euvwa-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: false
  }
}));

// Exponer la sesión a todas las vistas para la barra de navegación.
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', searchRoutes);
app.use('/', guestbookRoutes);
app.use('/', toolsRoutes);
app.use('/', usersRoutes);
app.use('/', debugRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
