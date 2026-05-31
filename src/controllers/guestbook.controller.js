const { exec, run, save } = require('../db');

exports.list = (req, res) => {
  const comments = exec(
    'SELECT id, name, content, created_at FROM guestbook_comments ORDER BY id DESC'
  );
  res.render('guestbook/index', { title: 'Libro de visitas', comments });
};

exports.create = (req, res) => {
  const name = (req.body.name || '').trim() || 'Anónimo';
  const content = (req.body.content || '').trim();

  if (!content) {
    return res.redirect('/guestbook');
  }

  // VULNERABLE: el contenido se guarda tal cual y luego se renderiza sin
  // escapar en la vista. Permite Stored XSS. En main-secure se sanitizará
  // la entrada y se renderizará con escape automático.
  run(
    'INSERT INTO guestbook_comments (name, content, created_at) VALUES (?, ?, ?)',
    [name, content, new Date().toISOString()]
  );
  save();

  res.redirect('/guestbook');
};
