FROM node:18.15.0-alpine3.17

RUN apk add --update ffmpeg

COPY . .
RUN yarn

CMD ["yarn", "start"]
