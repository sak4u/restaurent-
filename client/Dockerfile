# -------------------------------
# Étape 1 : Build du frontend
# -------------------------------
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------------
# Étape 2 : Nginx (production)
# -------------------------------
FROM nginx:alpine

# Nettoyer le contenu par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la config Nginx (le fichier est DANS le contexte ./client)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]