# Construire l'app
FROM oven/bun AS build

# Dossier de travail
WORKDIR /app

# Copie des fichiers
COPY bun.lockb .
COPY package.json .

# Installation des dépendances
RUN bun install

# Copie le code
COPY . .

# Créer le binaire
RUN bun run build 

# Plus petite image
FROM ubuntu:22.04

WORKDIR /app

COPY --from=build /app/cli /app/cli

CMD ["/app/cli"]
