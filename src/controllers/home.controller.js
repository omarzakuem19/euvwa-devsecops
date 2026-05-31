exports.index = (req, res) => {
  res.render('index', {
    title: 'euVWA',
    message: 'Bienvenido a euVWA. Aún estamos montando la aplicación.'
  });
};
