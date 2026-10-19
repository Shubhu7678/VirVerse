# Image used by the Docker execution driver:
#   docker build -t virvese-c-runner backend/runner
FROM alpine:3.20
RUN apk add --no-cache gcc musl-dev \
 && adduser -D -u 10001 runner
USER runner
WORKDIR /work
