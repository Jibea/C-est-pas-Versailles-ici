# Pour le developpement
FROM node:lts as development-stage

WORKDIR /app

COPY /app/package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "serve"]