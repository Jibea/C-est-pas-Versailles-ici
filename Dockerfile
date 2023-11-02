# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY /app/package*.json ./
RUN npm install
COPY /app .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /app
COPY /nginx.conf /etc/nginx/nginx.conf
EXPOSE 80