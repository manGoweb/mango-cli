# Build stage
FROM node:12-alpine AS builder

LABEL maintainer="mangoweb"
ARG version=master

RUN apk --no-cache add \
	alpine-sdk \
	autoconf \
	automake \
	libjpeg-turbo-utils \
	libtool \
	nasm \
	zlib-dev

RUN npm install --unsafe-perm -g https://github.com/manGoweb/mango-cli.git#$version

# Runtime stage
FROM node:12-alpine AS runtime
RUN apk --no-cache add \
	git

COPY --from=builder /usr/local/lib/node_modules/mango-cli /usr/local/lib/node_modules/mango-cli
RUN ln -s /usr/local/lib/node_modules/mango-cli/bin/mango /usr/local/bin/mango

# Optional development test step
# RUN (cd /usr/local/lib/node_modules/mango-cli && npm install-test)

ENTRYPOINT ["mango"]
CMD ["build"]
