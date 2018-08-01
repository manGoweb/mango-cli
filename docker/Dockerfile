FROM node:10

LABEL maintainer="mangoweb"

ARG version=master
RUN npm install --unsafe-perm -g https://github.com/manGoweb/mango-cli.git#$version

# Optional development test step
# RUN (cd /usr/local/lib/node_modules/mango-cli && npm install-test)

ENTRYPOINT ["mango"]
CMD ["build"]
