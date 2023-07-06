FROM node:alpine

WORKDIR /api

EXPOSE 3000

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
