// Manejador para rutas no encontradas (último middleware antes del error).
exports.notFound = (req, res) => {
  res.status(404).render('index', {
    title: 'No encontrado',
    message: 'La página que buscas no existe.'
  });
};

// VULNERABLE: el manejador de errores muestra el mensaje y el stack trace
// completos al usuario. Es Security Misconfiguration. En main-secure se
// devolverá un mensaje genérico y el stack solo se loggeará por consola.
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error', error: err });
};
