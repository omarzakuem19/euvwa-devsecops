const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const { getRow, run, save } = require('../db');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
const allowedMimetypes = ['image/png', 'image/jpeg', 'image/gif'];

// Almacenamiento seguro: nombre aleatorio + extensión segura inferida
// de la lista permitida. Nunca se conserva el nombre original.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = allowedExtensions.includes(ext) ? ext : '.bin';
    const safeName = crypto.randomBytes(16).toString('hex') + safeExt;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext) || !allowedMimetypes.includes(file.mimetype)) {
      return cb(null, false);
    }
    cb(null, true);
  }
});

// Wrapper para que un error de multer (p.ej. tamaño excedido) no rompa
// la página y se muestre como mensaje en el perfil.
exports.uploadMiddleware = function (req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      req.uploadError = err.message || 'Error en la subida del archivo.';
    }
    next();
  });
};

function renderProfile(req, res, extras = {}) {
  const user = getRow(
    'SELECT id, username, email, role, avatar_path FROM users WHERE id = ?',
    [req.session.userId]
  );

  if (!user) {
    return req.session.destroy(() => res.redirect('/login'));
  }

  res.render('profile/index', Object.assign(
    { title: 'Perfil', user, uploadError: null },
    extras
  ));
}

exports.show = (req, res) => {
  renderProfile(req, res);
};

exports.saveAvatar = (req, res) => {
  if (req.uploadError || !req.file) {
    const message = req.uploadError ||
      'Archivo rechazado. Solo se aceptan imágenes (.png, .jpg, .jpeg, .gif) de hasta 2 MB.';
    return res.status(400).render('profile/index', {
      title: 'Perfil',
      user: getRow(
        'SELECT id, username, email, role, avatar_path FROM users WHERE id = ?',
        [req.session.userId]
      ),
      uploadError: message
    });
  }

  const avatarPath = '/uploads/' + req.file.filename;
  run('UPDATE users SET avatar_path = ? WHERE id = ?', [avatarPath, req.session.userId]);
  save();

  res.redirect('/profile');
};
