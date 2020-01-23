FROM node:10

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8888
ENV PORT=8888
CMD [ "npm", "start" ]
