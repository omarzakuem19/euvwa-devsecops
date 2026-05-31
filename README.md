# euVWA

Aplicación web para la asignatura de Desarrollo Seguro de Web y Apps. Está inspirada en DVWA y portada a Node.js + Express. Sirve como laboratorio local para practicar la explotación de vulnerabilidades del OWASP Top 10 y comparar el código vulnerable con su versión corregida.

## Ramas del proyecto

- `main-vulnerable`: versión explotable. Contiene 9 vulnerabilidades intencionadas para reproducir los ataques en local.
- `main-secure`: **esta rama**. Implementa exactamente las mismas funcionalidades que `main-vulnerable`, pero con cada vulnerabilidad corregida aplicando buenas prácticas (consultas parametrizadas, escape de salida, `execFile`, `bcrypt`, `helmet`, etc.).

Las capturas de explotación que aparecen más abajo se han tomado en `main-vulnerable`. Esta rama (`main-secure`) corrige esas mismas funcionalidades; si se intenta repetir el ataque, ya no funciona.

## Requisitos

- Node.js 18 o superior.
- npm.
- No hace falta instalar Visual Studio ni nada nativo: la base de datos usa `sql.js` (SQLite compilado a WebAssembly) y el hash de contraseñas usa `bcryptjs`.

## Ejecutar `main-vulnerable`

```bash
git checkout main-vulnerable
npm install
cp .env.example .env
npm run seed
npm run dev
```

(En PowerShell: `Copy-Item .env.example .env`.)

La aplicación queda disponible en `http://localhost:3000`. Usuarios de prueba: `admin / admin` y `user / user`. En esta rama las contraseñas se guardan en texto plano a propósito.

## Ejecutar `main-secure`

```bash
git checkout main-secure
npm install
cp .env.example .env
# Recomendado: cambia SESSION_SECRET en .env por una cadena tuya.
npm run seed
npm run dev
```

Mismos usuarios `admin / admin` y `user / user`, pero ahora las contraseñas se guardan hasheadas con `bcrypt`. El seed regenera la base de datos con los hashes correctos.

> Si vienes de probar `main-vulnerable`, conviene borrar `data/euvwa.sqlite` antes de hacer `npm run seed` en `main-secure`, ya que el formato de las contraseñas cambia.

## Tabla comparativa: vulnerable vs segura

| Nº | Vulnerabilidad | Ruta afectada | Comportamiento en `main-vulnerable` | Corrección en `main-secure` |
|----|----------------|---------------|-------------------------------------|-----------------------------|
| 1 | SQL Injection | `/login` | La query se construye concatenando `username` y `password` y se ejecuta con `db.exec`. Permite saltarse la autenticación. | Consulta parametrizada con `?` y `bcrypt.compare` para la contraseña. |
| 2 | Reflected XSS | `/search?q=` | El parámetro `q` se imprime con `<%- q %>`, sin escape. | Render con `<%= q %>` (escape automático de EJS). |
| 3 | Stored XSS | `/guestbook` | Los comentarios se insertan tal cual y se imprimen con `<%- comment.content %>`. | Mismo almacenamiento, pero render con `<%= comment.content %>`. |
| 4 | Command Injection | `/tools/ping` | `child_process.exec('ping ' + flags + ' ' + host)`. La shell interpreta `&` o `;`. | `execFile('ping', [...])` (sin shell) y validación previa del host (IPv4 o nombre de dominio). |
| 5 | Insecure File Upload | `/profile/avatar` y `/uploads/<archivo>` | `multer` sin filtros, conserva el nombre original y la carpeta se sirve estáticamente con `Content-Type` por extensión. | Whitelist de extensiones (`.png`, `.jpg`, `.jpeg`, `.gif`), comprobación de MIME, renombrado a hex aleatorio y límite de 2 MB. |
| 6 | Broken Authentication | `/login`, cookie de sesión | Contraseñas en plano, secret hardcodeado, cookie sin `HttpOnly` y sin rate limit. | `bcrypt`, `SESSION_SECRET` desde `.env`, cookie `httpOnly: true` + `sameSite: 'lax'` + `maxAge`, y `express-rate-limit` (5 intentos/min). |
| 7 | Broken Access Control (IDOR) | `/users/:id` | Solo se comprueba que haya sesión. Cualquier usuario logueado puede ver a otro cambiando el id. | Comprobación de propietario o rol admin; en caso contrario responde HTTP 403. |
| 8 | Security Misconfiguration | `/debug/error` y cabeceras HTTP | `X-Powered-By: Express` activo, secret hardcodeado y error handler que muestra mensaje + stack trace al usuario. | `helmet()`, `app.disable('x-powered-by')` y error handler genérico (el stack solo va a consola). |
| 9 | Sensitive Data Exposure | `/debug` | Devuelve la contraseña en claro, email, rol, session id, token simulado y datos internos de la app. | `/debug` restringido a rol admin (`requireAuth` + `requireAdmin`) y solo expone metadatos no sensibles (versión, modo, Node, plataforma, uptime). |

### Cómo verificar las correcciones en `main-secure`

- **SQLi:** `/login` con usuario `admin' OR '1'='1' --` y contraseña `x` → "Credenciales inválidas".
- **Reflected XSS:** `/search?q=<script>alert('XSS')</script>` → el payload aparece como texto.
- **Stored XSS:** publicar `<img src=x onerror=alert(1)>` en `/guestbook` → al recargar se muestra como texto.
- **Command Injection:** `/tools/ping?host=127.0.0.1+%26+whoami` → "Host no válido". Con `127.0.0.1` el ping funciona normalmente.
- **File Upload:** intentar subir `avatar.html` → "Archivo rechazado". Solo se aceptan imágenes de la whitelist.
- **Broken Auth:** DevTools → `document.cookie` → no aparece `connect.sid` (cookie con `HttpOnly`). 5 logins fallidos seguidos → "Demasiados intentos".
- **IDOR:** logueado como `user`, abrir `/users/1` → HTTP 403.
- **Misconfig:** `/debug/error` muestra "Error 500" genérico sin stack. `curl -I http://localhost:3000/` no incluye `X-Powered-By`.
- **SDE:** `/debug` como `user` → 403; como `admin` solo metadatos no sensibles. `/profile` no muestra contraseña ni session id.

## Vulnerabilidades y evidencias de explotación

Las capturas se han tomado en `main-vulnerable` ejecutándose en local. En esta rama (`main-secure`) las mismas pruebas ya no son explotables.

| Nº | Vulnerabilidad | Payload o prueba en `main-vulnerable` | Captura |
|----|----------------|---------------------------------------|---------|
| 1 | SQL Injection | Usuario `admin' OR '1'='1' --`, contraseña cualquiera (p. ej. `x`). Entra como admin sin saber la contraseña real. | [01-sql-injection.png](docs/evidence/vulnerable/01-sql-injection.png) |
| 2 | Reflected XSS | URL `/search?q=<script>alert('XSS')</script>`. Se ejecuta `alert('XSS')` al cargar la página. | [02-reflected-xss.png](docs/evidence/vulnerable/02-reflected-xss.png) |
| 3 | Stored XSS | Comentario en `/guestbook` con `<img src=x onerror=alert(1)>` o `<script>alert(1)</script>`. El alert salta cada vez que se abre la página. | [03-stored-xss.png](docs/evidence/vulnerable/03-stored-xss.png) |
| 4 | Command Injection | `/tools/ping` con host `127.0.0.1 & whoami` (Windows) o `127.0.0.1; whoami` (Linux/macOS). Aparece la salida de `whoami` después del ping. | [04-command-injection.png](docs/evidence/vulnerable/04-command-injection.png) |
| 5 | Insecure File Upload | Subir `avatar.html` con `<script>alert('File Upload XSS')</script>` y abrir `http://localhost:3000/uploads/avatar.html`. El navegador interpreta el HTML y dispara el alert. | [05-insecure-file-upload.png](docs/evidence/vulnerable/05-insecure-file-upload.png) |
| 6 | Broken Authentication | Tras iniciar sesión, abrir DevTools y ejecutar `document.cookie`. Se ve `connect.sid`, lo que confirma que la cookie no tiene `HttpOnly`. | [06-broken-authentication.png](docs/evidence/vulnerable/06-broken-authentication.png) |
| 7 | Broken Access Control (IDOR) | Login como `user` (id 2) y abrir `/users/1`. Se muestran los datos del admin sin error. | [07-broken-access-control-idor.png](docs/evidence/vulnerable/07-broken-access-control-idor.png) |
| 8 | Security Misconfiguration | Abrir `/debug/error`: aparecen mensaje y stack trace completos. Con `curl -I http://localhost:3000/` se ve `X-Powered-By: Express`. | [08-security-misconfiguration.png](docs/evidence/vulnerable/08-security-misconfiguration.png) |
| 9 | Sensitive Data Exposure | Login y abrir `/debug`. La página muestra la contraseña en texto plano, el session id, un token simulado y datos internos del usuario y de la app. | [09-sensitive-data-exposure.png](docs/evidence/vulnerable/09-sensitive-data-exposure.png) |

## Estructura del proyecto

```
src/
  app.js                # configuración de Express, helmet, sesión segura
  server.js             # arranque
  db/                   # conexión sql.js + seed con bcrypt
  routes/               # definición de endpoints
  controllers/          # lógica de cada endpoint
  middlewares/          # requireAuth, requireAdmin, notFound, errorHandler
  views/                # EJS con partials manuales
  public/css/
data/                   # base de datos SQLite generada (no en Git)
uploads/                # avatares subidos (no en Git)
docs/evidence/          # capturas de explotación tomadas en main-vulnerable
```

## Notas

- La cookie de sesión usa `secure: false` porque la app se ejecuta en `http://localhost`. En un despliegue real con HTTPS habría que pasar a `secure: true`.
- Se usa `bcryptjs` (implementación pura en JS) en lugar de `bcrypt` para evitar el problema de compilación nativa con Node 24 en Windows. La API es la misma.
- CSRF no se incluye como protección obligatoria. Podría añadirse como mejora si las pruebas no se rompen.

## Aviso

Este proyecto es un laboratorio local académico. La rama `main-vulnerable` solo debe ejecutarse en local; no debe desplegarse en internet. La rama `main-secure` aplica las correcciones recogidas en la tabla comparativa para las mismas funcionalidades.
