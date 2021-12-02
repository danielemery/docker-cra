FROM node:16 as node

FROM nginx

# Grab and link the node binaries from the node image.
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /usr/app
RUN npm i joi

# Startup script
COPY ./docker-cra-entrypoint.sh /docker-entrypoint.d
