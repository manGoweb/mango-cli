FROM node:8

MAINTAINER mangoweb

# Install dependencies
RUN apt-get update \
    && apt-get install -y \
        libelf-dev \
        ocaml

ARG version=master
RUN npm install --unsafe-perm -g https://github.com/manGoweb/mango-cli.git#$version

ENTRYPOINT ["mango"]
CMD ["build"]
