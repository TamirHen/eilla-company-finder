FROM node:18-alpine

WORKDIR /client
COPY .. ./
RUN npm ci
RUN npm install -g react-scripts
RUN chown -R node:node /client
