FROM node:8.14.0-alpine

WORKDIR /opt/iotagent-http

ENV LD_LIBRARY_PATH=/dojot/nodejs/node_modules/node-rdkafka/build/deps/

RUN apk add git python make bash gcc g++ zlib-dev --no-cache

COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .

EXPOSE 3005
CMD ["npm", "start"]
