FROM node:16 as node

FROM nginx
ARG DOCKER_CRA_VERSION

# Grab and link the node binaries from the node image.
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Set working directory
WORKDIR /usr/app

# Install docker-cra package globally
RUN npm install -g docker-cra@"${DOCKER_CRA_VERSION}"
COPY ./node_modules ./node_modules

# Run version to validate
RUN docker-cra --version

# Prepare startup script
COPY ./docker-cra-entrypoint.sh /docker-entrypoint.d
