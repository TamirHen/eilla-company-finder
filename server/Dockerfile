FROM node:18-alpine

WORKDIR /server
COPY .. ./
RUN npm ci
RUN npm install -g ts-node
RUN chown -R node:node /server