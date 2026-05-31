require('dotenv').config();

const app = require('./app');
const { init } = require('./db');

const port = parseInt(process.env.PORT, 10) || 3000;

init()
  .then(() => {
    app.listen(port, () => {
      console.log(`euVWA escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });
