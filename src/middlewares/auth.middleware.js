// Middleware sencillo para rutas que requieren sesión iniciada.
// Si no hay usuario en sesión, redirige a /login.
exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Middleware adicional para rutas restringidas a admin. Asume que ya se
// ha pasado por requireAuth (o que la ruta lo encadena antes).
exports.requireAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).render('users/show', {
      title: 'Acceso denegado',
      user: null,
      requestedId: req.session.userId || null,
      forbidden: true
    });
  }
  next();
};
