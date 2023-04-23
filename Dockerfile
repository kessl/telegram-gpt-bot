FROM node:18.16.0-bullseye-slim
RUN apk add --update ffmpeg

COPY . .
RUN yarn

CMD ["yarn", "start"]
