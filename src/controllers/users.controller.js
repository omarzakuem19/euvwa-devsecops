const { getRow } = require('../db');

exports.show = (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  if (Number.isNaN(requestedId)) {
    return res.status(404).render('users/show', {
      title: 'Usuario',
      user: null,
      requestedId: req.params.id,
      forbidden: false
    });
  }

  // Solo el propio usuario o un admin pueden consultar el registro.
  const isOwner = requestedId === req.session.userId;
  const isAdmin = req.session.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).render('users/show', {
      title: 'Acceso denegado',
      user: null,
      requestedId,
      forbidden: true
    });
  }

  const user = getRow(
    'SELECT id, username, email, role, avatar_path FROM users WHERE id = ?',
    [requestedId]
  );

  res.render('users/show', {
    title: 'Usuario',
    user,
    requestedId,
    forbidden: false
  });
};
