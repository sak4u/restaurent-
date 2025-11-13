# --------------------------
# Étape 1 : Construction
# --------------------------
FROM node:20-alpine AS builder

# Créer le dossier de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord
COPY package*.json ./

# Installer toutes les dépendances (y compris dev)
RUN npm install

# Copier le reste du code source
COPY . .

# Générer le client Prisma (nécessaire avant le build)
RUN npx prisma generate

# Compiler le code TypeScript
RUN npm run build


# --------------------------
# Étape 2 : Exécution
# --------------------------
FROM node:20-alpine AS runner

# Créer le dossier de travail
WORKDIR /app

# Copier uniquement ce qui est nécessaire pour exécuter l'app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Installer uniquement les dépendances de production
RUN npm install --only=production

# Regénérer le client Prisma pour l'environnement de prod
RUN npx prisma generate

# Exposer le port utilisé par NestJS
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
