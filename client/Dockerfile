# -------------------------------
# Étape 1 : Construction de l'application
# -------------------------------
# On utilise une image Node officielle (version LTS)
FROM node:20 AS build

# Définit le dossier de travail à l'intérieur du conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json ou yarn.lock
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le projet dans le conteneur
COPY . .

# Construit l’application pour la production
RUN npm run build

# -------------------------------
# Étape 2 : Serveur Nginx pour la production
# -------------------------------
FROM nginx:alpine

# Supprime la configuration par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie les fichiers construits du build précédent
COPY --from=build /app/dist /usr/share/nginx/html

# Copie (optionnel) une configuration Nginx personnalisée
# Si tu veux gérer les routes React (ex: react-router-dom)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80
EXPOSE 80

# Lance Nginx
CMD ["nginx", "-g", "daemon off;"]
