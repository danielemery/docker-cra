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

1. As window.env.js is public the schema ensures nothing sensitive ends up in the file
2. As we have no validation of env variable types at compile type, we need to ensure they are correctly provided at runtime

A file called `.env.schema.js` should be created in the root of the project with any environment variables defined. `docker-cra` also supports the following built-in environment variables:

- `REACT_APP_CLIENT_VERSION` (required string)
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

It's recommended to match the version of docker-cra npm version with the docker-cra docker tag version.

## To Do

- Support version bumping the app and supporting old chunks that client's might not have loaded
