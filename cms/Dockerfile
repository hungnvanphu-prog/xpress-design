FROM node:18-alpine

# Strapi cần các lib để build sharp/bcrypt
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git python3

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --production=false

COPY . .

RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "start"]