FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

COPY prisma.config.ts ./

COPY tsconfig.json ./

COPY src ./src

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD npx prisma migrate deploy && npx prisma db seed && node dist/index.js