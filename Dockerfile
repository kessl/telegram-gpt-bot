FROM node:18.16.0-bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY . .
RUN yarn

CMD ["yarn", "start"]
