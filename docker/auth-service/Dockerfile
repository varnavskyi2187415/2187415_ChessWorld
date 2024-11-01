FROM node:21.5.0

WORKDIR /usr/src/app

COPY ./auth-service/package*.json .

RUN npm install

COPY ./auth-service .

EXPOSE 3001

CMD ["npx", "nodemon", "src/index.ts"]
