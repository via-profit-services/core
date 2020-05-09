#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
DIR=$(dirname $SOURCE);
FILE="$DIR/a.txt";

curl http://localhost:3005/graphql \
  -F operations='{ "query": "mutation ($file: FileUpload!, $info: FileInfo!) {upload{upload(file: $file  info: $info) }}", "variables": { "file": null, "info": {"name": "Some name"} } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@$FILE

# { "query": "mutation ($file: FileUpload!, $info: FileInfo!) {upload{upload(file: $file  info: $info) }}", "variables": { "file": null, "info": {"name": "Some name"} } }