# Pour le developpement
FROM node:lts as development-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY /app/package*.json ./

RUN npm install

RUN npm install @vue/cli

COPY /app .

CMD ["npm", "run", "serve"]