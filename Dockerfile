FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN apk add --no-cache bash

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
