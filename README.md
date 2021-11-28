## Motivation

This project was driven by two main goals:

1. An easy way to serve create-react-app applications out of docker containers.
2. A way to re-use the same artifact between test and production environments.

## Features

- Inject environment variables at container runtime
- Lightweight nginx serving implementation

## Usage

### Requirements

- Node 14 or later

### Example

For a working example see the [docker-cra-example](https://github.com/danielemery/docker-cra-example) repository.

### Base Docker Image

A base docker image providing a lightweight nginx server with the docker-cra cli included can be found at dockerhub repository [docker-cra](https://hub.docker.com/r/demery/docker-cra).

This is the recommended way of deploying your `docker-cra`-enabled application into a docker container.

An example of dockerfile usage:
```Dockerfile
FROM demery/docker-cra

# TODO Implement This
```

## Challenges

- Support version bumping the app and supporting old chunks that client's might not have loaded
