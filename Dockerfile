# euVWA - Dockerfile multi-stage con hardening de seguridad
# La misma imagen sirve para la rama vulnerable y para la rama segura.
# El comportamiento del pipeline cambia por el codigo y las dependencias,
# no por el contenedor, que esta endurecido igual en ambos casos.

# ===== Stage 1: instalacion de dependencias de produccion =====
FROM node:20-alpine AS deps

WORKDIR /app

# Copiamos solo los manifiestos para aprovechar la cache de capas.
COPY package.json package-lock.json ./

# Instalacion reproducible, solo dependencias de produccion y sin ejecutar
# scripts de post-instalacion (reduce el riesgo de ejecucion de codigo en el build).
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ===== Stage 2: imagen final de ejecucion =====
FROM node:20-alpine AS runtime

# Variables de entorno de produccion. No contienen secretos.
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiamos primero el codigo de la aplicacion.
COPY --chown=node:node . .

# Copiamos las dependencias ya resueltas desde el stage anterior.
# Va despues del codigo para que, si cambiase el .dockerignore, las
# dependencias de produccion del builder no queden sobrescritas.
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# Creamos los directorios de datos y subidas con permisos para el usuario node.
# data/ guarda la base SQLite generada por el seed y uploads/ los avatares.
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app/data /app/uploads

# La imagen oficial de Node trae el usuario sin privilegios "node" (uid 1000).
# Ejecutamos el proceso con ese usuario en lugar de root.
USER node

EXPOSE 3000

# Comprobacion de salud: pide la home y considera sano cualquier codigo < 500.
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

# Arranque: primero el seed (crea tablas y usuarios) y despues el servidor.
CMD ["sh", "-c", "node src/db/seed.js && node src/server.js"]
