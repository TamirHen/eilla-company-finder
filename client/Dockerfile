FROM node:18-alpine

WORKDIR /client
COPY .. ./
RUN npm ci
RUN chown -R node:node /client