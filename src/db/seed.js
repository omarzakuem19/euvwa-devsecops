const bcrypt = require('bcryptjs');
const { init, save, exec, run } = require('./index');

(async () => {
  console.log('Inicializando la base de datos de euVWA...');
  await init();

  exec(`
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT,
      avatar_path TEXT
    );

    DROP TABLE IF EXISTS guestbook_comments;
    CREATE TABLE guestbook_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Las contraseñas se guardan ya hasheadas con bcrypt.
  const users = [
    { username: 'admin', password: 'admin', email: 'admin@euvwa.local', role: 'admin' },
    { username: 'user',  password: 'user',  email: 'user@euvwa.local',  role: 'user'  }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    run(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [u.username, hash, u.email, u.role]
    );
  }

  save();

  console.log('Tablas creadas: users, guestbook_comments.');
  console.log('Usuarios de prueba (contraseñas hasheadas con bcrypt):');
  for (const u of users) {
    console.log(` - ${u.username} / ${u.password}`);
  }
  console.log('Listo.');
})().catch(err => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
