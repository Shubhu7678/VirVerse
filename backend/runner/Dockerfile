# Image used by the Docker execution driver:
#   docker build -t virvese-c-runner backend/runner
FROM node:22-alpine
USER root
RUN apk add --no-cache gcc musl-dev python3 \
 && adduser -D -u 10001 runner
USER runner
WORKDIR /work
