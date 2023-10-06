FROM oven/bun

# Dossier de travail
WORKDIR /app

# Copie des fichiers
COPY bun.lockb .
COPY package.json .

# Installation des dépendances
RUN bun install

# Copie le code
COPY . .

# Port
EXPOSE 8080

# Build
CMD ["bun", "run", "build"]

