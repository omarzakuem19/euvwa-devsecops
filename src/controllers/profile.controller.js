const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { getRow, run, save } = require('../db');

// Carpeta donde se guardan los avatares subidos. Se sirve estáticamente
// desde /uploads (ver app.js).
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// VULNERABLE: el archivo se guarda con el nombre original tal cual,
// sin filtrar extensión ni MIME, en una carpeta accesible públicamente.
// En main-secure se usará una whitelist de extensiones, validación de
// MIME real y un nombre generado por el servidor.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Middleware multer expuesto para que la ruta lo monte antes del handler.
exports.uploadMiddleware = upload.single('avatar');

exports.show = (req, res) => {
  const user = getRow(
    'SELECT id, username, email, role, avatar_path FROM users WHERE id = ?',
    [req.session.userId]
  );

  if (!user) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
    return;
  }

  res.render('profile/index', { title: 'Perfil', user });
};

exports.saveAvatar = (req, res) => {
  if (!req.file) {
    return res.redirect('/profile');
  }

  const avatarPath = '/uploads/' + req.file.filename;
  run('UPDATE users SET avatar_path = ? WHERE id = ?', [avatarPath, req.session.userId]);
  save();

  res.redirect('/profile');
};
