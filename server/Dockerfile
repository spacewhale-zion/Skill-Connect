FROM node:18-alpine AS base

WORKDIR /app/server

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm","run","dev"]