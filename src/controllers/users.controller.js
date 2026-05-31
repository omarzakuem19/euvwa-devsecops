const { getRow } = require('../db');

exports.show = (req, res) => {
  // VULNERABLE: no se comprueba que :id pertenezca al usuario logueado
  // ni que tenga rol admin. Cualquier usuario autenticado puede consultar
  // los datos de otros cambiando el id en la URL (IDOR).
  const user = getRow(
    'SELECT id, username, email, role, avatar_path FROM users WHERE id = ?',
    [req.params.id]
  );

  res.render('users/show', {
    title: 'Usuario',
    user,
    requestedId: req.params.id
  });
};
