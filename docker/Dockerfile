FROM node:14

LABEL maintainer="mangoweb"

ARG VERSION=master
RUN npm install -g npm@7 && npm install -g https://github.com/manGoweb/mango-cli.git#$VERSION

# Optional development test step
# RUN (cd /usr/local/lib/node_modules/mango-cli && npm install-test)

ENTRYPOINT ["mango"]
CMD ["build"]
