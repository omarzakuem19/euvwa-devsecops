// Manejador para rutas no encontradas (último middleware antes del error).
exports.notFound = (req, res) => {
  res.status(404).render('index', {
    title: 'No encontrado',
    message: 'La página que buscas no existe.'
  });
};

// Manejador de errores: el stack solo va a consola; al usuario se le
// devuelve una página genérica sin detalles técnicos.
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error' });
};
