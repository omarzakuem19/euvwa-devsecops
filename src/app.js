const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const helmet = require('helmet');

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

// Cabeceras de seguridad y eliminar X-Powered-By.
app.disable('x-powered-by');
app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Avatares subidos. En esta rama solo se aceptan imágenes (validadas en
// la ruta de subida), así que servir el directorio sigue siendo seguro.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Sesión con secret desde .env (con fallback solo para desarrollo) y
// cookie endurecida.
app.use(session({
  secret: process.env.SESSION_SECRET || 'euvwa-dev-only-change-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 4
  }
}));

// Exponer la sesión a las vistas (la nav la usa).
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
