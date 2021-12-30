## Motivation

This project was driven by two main goals:

1. An easy way to serve create-react-app applications out of docker containers.
2. A way to re-use the same artifact between test and production environments.

And a bonus goal (under development):

3. A way to support old chunks for CRA versions still out in the wild.

## Features

- Inject environment variables at container runtime
- Lightweight nginx serving implementation

## Usage

### Requirements

- Node 14 or later

### Example

For a working example see the [docker-cra-example](https://github.com/danielemery/docker-cra-example) repository.

### Schema

A joi schema is required to validate incoming environment variables. This serves two purposes:

1. As `window.env.js` is public, the schema ensures nothing sensitive ends up in the file.
2. As we have no validation of env variable types at compile type, we need to ensure they are provided and correctly typed at runtime.

A file called `env.schema.js` should be created in the root of the project with all required environment variables defined. In additional to those defined, `docker-cra` automatically supports the following environment variables:

- `CLIENT_VERSION` (required string)
- `PUBLIC_URL` (serve path - or leave blank to serve at `/`)

### Base Docker Image

A base docker image providing a lightweight nginx server with the docker-cra cli included can be found at dockerhub repository [docker-cra](https://hub.docker.com/r/demery/docker-cra).

This is the recommended way of deploying your `docker-cra`-enabled application into a docker container.

An example of dockerfile usage:

```Dockerfile
FROM demery/docker-cra:v0.1.1

COPY env.schema.js ./env.schema.js
COPY build /usr/share/nginx/html
```

It's recommended to match the version of `docker-cra` npm version with the `docker-cra` docker tag version to ensure local development more closely mirrors docker deploys.

## To Do

- Support version bumping the app and supporting old chunks that client's might not have loaded

## Local Development

Building and testing locally is best done along with the companion repo [docker-cra-example](https://github.com/danielemery/docker-cra-example).

In this repo you can run the following commands to make the local build available to the example project.

```sh
npm run build && npm link
docker build -t docker-cra:latest .
```

And then in the example run the following to consume and test.

```sh
# Install dependencies
npm ci
npm link docker-cra

# Local dev test
npm start
```
