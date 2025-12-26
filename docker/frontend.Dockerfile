FROM node:20-alpine

# ═══════════════════════════════════════════════════════════
# Frontend Dockerfile - Optimizado para desarrollo rápido
# ═══════════════════════════════════════════════════════════

# Instalar dependencias del sistema
RUN apk add --no-cache git python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Instalar dependencias globales de Quasar
RUN npm install -g @quasar/cli

# Exponer puerto
EXPOSE 9000

# Comando de inicio - instala dependencias si es necesario y ejecuta dev server
# El volumen de node_modules en docker-compose.yml preserva las dependencias entre reinicios
CMD ["sh", "-c", "if [ ! -d 'node_modules/@quasar' ]; then echo 'Installing dependencies...' && npm install; fi && npx quasar dev --hostname 0.0.0.0"]

