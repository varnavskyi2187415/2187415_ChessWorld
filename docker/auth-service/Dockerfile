FROM node:21.5.0

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install -g nodemon

RUN npm install
