FROM node:latest

WORKDIR /app

COPY . /app

RUN npm clean-install && \
    npm run build

CMD [ "npm", "run", "start" ]