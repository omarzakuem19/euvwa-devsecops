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

  // El contenido se guarda tal cual; la vista lo escapa con <%= %> al
  // renderizar, lo que evita Stored XSS.
  run(
    'INSERT INTO guestbook_comments (name, content, created_at) VALUES (?, ?, ?)',
    [name, content, new Date().toISOString()]
  );
  save();

  res.redirect('/guestbook');
};
