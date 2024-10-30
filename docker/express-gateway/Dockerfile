FROM node:16-alpine

WORKDIR /usr/src/app

COPY ./express-gateway .

RUN npm install -g express-gateway

EXPOSE 8080

CMD ["npm", "start"]