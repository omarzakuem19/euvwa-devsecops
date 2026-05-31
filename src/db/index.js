const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// Usamos sql.js (SQLite compilado a WebAssembly) para no depender de
// binarios nativos en Windows. La base de datos se carga en memoria
// y se persiste a data/euvwa.sqlite llamando a save().

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'euvwa.sqlite');

let db = null;

async function init() {
  if (db) return;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const SQL = await initSqlJs({
    locateFile: file => require.resolve(`sql.js/dist/${file}`)
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
}

function save() {
  if (!db) return;
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

// Ejecuta una query SQL en bruto (sin parámetros). Devuelve las filas
// del primer SELECT como array de objetos {columna: valor}, o array
// vacío si no hay resultados. Se usa en la rama vulnerable porque la
// query del login se construye concatenando strings.
function exec(sql) {
  const results = db.exec(sql);
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Ejecuta una sentencia parametrizada sin devolver resultado.
function run(sql, params = []) {
  db.run(sql, params);
}

// Ejecuta una sentencia parametrizada y devuelve la primera fila o null.
function getRow(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

module.exports = { init, save, exec, run, getRow };
