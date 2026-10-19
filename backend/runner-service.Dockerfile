FROM node:22-alpine

RUN apk add --no-cache docker-cli
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5002
ENV EXECUTION_DRIVER=docker

EXPOSE 5002
CMD ["node", "src/runner/server.js"]
