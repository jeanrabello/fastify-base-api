FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN apk add --no-cache bash

COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "run", "start"]
