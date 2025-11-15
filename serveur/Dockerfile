# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install 

# Copier le code source
COPY . .
COPY tsconfig*.json ./

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]