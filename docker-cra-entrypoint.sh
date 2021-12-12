#!/bin/sh
docker-cra --version
docker-cra -d ../share/nginx/html -s ./env.schema.js
