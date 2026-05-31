Capturas de explotación para main-vulnerable

01-sql-injection.png: payload de login SQLi y acceso posterior como admin.
02-reflected-xss.png: XSS reflejado en /search.
03-stored-xss.png: payload almacenado en /guestbook y ejecución al recargar.
04-command-injection.png: /tools/ping con 127.0.0.1 & whoami.
05-insecure-file-upload.png: subida de avatar.html y ejecución desde /uploads/avatar.html.
06-broken-authentication.png: cookie connect.sid visible mediante document.cookie.
07-broken-access-control-idor.png: usuario normal accediendo a /users/1 y viendo datos de admin.
08-security-misconfiguration.png: stack trace en /debug/error y cabecera X-Powered-By: Express.
09-sensitive-data-exposure.png: /debug exponiendo password en claro, session id y token simulado.
