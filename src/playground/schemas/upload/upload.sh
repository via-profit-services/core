#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
DIR=$(dirname $SOURCE);
FILE="$DIR/a.txt";

curl http://localhost:3005/graphql \
  -F operations='{ "query": "mutation ($file: FileUpload!){upload{upload(file: $file)}}", "variables": { "file": null } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@$FILE
  