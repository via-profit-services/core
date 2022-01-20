#!/bin/bash

# Current directory
CURRENTDIR=$(dirname "$(readlink -f "$0")")

# Filename relative current directory
FILENAME="file-to-upload.jpeg"

# GraphQL request is: ------------------------------ #
#                                                    #
# mutation UploadFiles($filesList: [FileUpload!]!) { #
#   uploadFiles(filesList: $filesList) {             #
#     location                                       #
#     mimeType                                       #
#   }                                                #
# }                                                  #
# -------------------------------------------------- #


curl --request POST \
  --url http://localhost:8081/graphql \
  --form 'operations={ "query": "mutation UploadFiles($filesList: [FileUpload!]!) {uploadFiles(filesList: $filesList) {location mimeType}}", "variables":{"filesList":[null]}, "operationName": "UploadFiles" }' \
  --form 'map={"0":["variables.filesList.0"]}' \
  --form 0=@$CURRENTDIR/$FILENAME
