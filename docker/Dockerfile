FROM node:7

MAINTAINER mangoweb

RUN npm install -g https://github.com/manGoweb/mango-cli.git#deploy/dockerhub
RUN apt-get update && \
	apt-get install \
		build-essential \
		libc6 \
		-y

ENV HOST_MOUNT /usr/src/build
VOLUME [$HOST_MOUNT]
WORKDIR $HOST_MOUNT

ENTRYPOINT ["mango"]
CMD ["build"]
