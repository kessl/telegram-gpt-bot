FROM node:18.16.0-bullseye-slim
RUN apt update && apt install ffmpeg

COPY . .
RUN yarn

CMD ["yarn", "start"]
