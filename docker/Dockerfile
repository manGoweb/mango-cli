FROM node:7

MAINTAINER mangoweb

ARG version=master
RUN npm install -g https://github.com/manGoweb/mango-cli.git#$version

ENTRYPOINT ["mango"]
CMD ["build"]
