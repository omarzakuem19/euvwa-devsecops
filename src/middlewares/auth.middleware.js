// Middleware sencillo para rutas que requieren sesión iniciada.
// Si no hay usuario en sesión, redirige a /login.
exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};
