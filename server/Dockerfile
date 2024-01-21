FROM node:18-alpine

WORKDIR /server
COPY .. ./
RUN npm ci
RUN chown -R node:node /server