// Lista estática de módulos sobre los que se puede buscar.
const items = [
  { name: 'Login',             description: 'Acceso de usuarios a la aplicación.' },
  { name: 'Perfil',            description: 'Información personal del usuario que ha iniciado sesión.' },
  { name: 'Buscador',          description: 'Búsqueda simple de módulos y productos.' },
  { name: 'Libro de visitas',  description: 'Sección de comentarios públicos.' },
  { name: 'Subida de avatar',  description: 'Permite cambiar la imagen del perfil.' },
  { name: 'Herramienta ping',  description: 'Comprueba la conectividad con un host.' }
];

exports.search = (req, res) => {
  const q = req.query.q || '';

  let results = [];
  if (q) {
    const needle = q.toLowerCase();
    results = items.filter(item =>
      item.name.toLowerCase().includes(needle) ||
      item.description.toLowerCase().includes(needle)
    );
  }

  res.render('search/index', {
    title: 'Buscador',
    q,
    results,
    searched: q.length > 0
  });
};
