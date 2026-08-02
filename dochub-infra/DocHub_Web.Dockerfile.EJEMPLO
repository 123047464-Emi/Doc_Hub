# Dockerfile para DocHub_Web
# Colocar este archivo dentro de la carpeta DocHub_Web/
#
# Supuesto: `npm run build` genera la carpeta `dist/` (comportamiento
# estandar de Vite) y `server.js` la sirve con Express (o similar)
# leyendo el puerto de la variable de entorno PORT.
# Si tu server.js hace algo distinto, mandamelo y ajusto esto.

# Dockerfile para DocHub_Web
# Colocar este archivo dentro de la carpeta DocHub_Web/
#
# IMPORTANTE: NO usa server.js para servir la pagina (ese archivo es una
# API mock aparte, no el frontend). Aqui se compila el proyecto de Vite
# (npm run build -> carpeta dist/) y se sirve con Nginx, que es lo
# estandar para una SPA de React en produccion.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

