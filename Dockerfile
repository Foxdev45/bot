# FROM rockylinux:9.1.20230215
FROM node:18.15

WORKDIR /bot


RUN apt update -y


COPY . .

RUN npm install
RUN npm install play-dl

CMD [ "npm", "run", "start" ]