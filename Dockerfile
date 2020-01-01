FROM node:10

WORKDIR /usr/src/app
ADD . /usr/src/app

RUN yarn
RUN yarn build

EXPOSE 3000

CMD ["yarn", "serve"]
