#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
DIR=$(dirname $SOURCE);
FILE="$DIR/a.txt";

curl http://localhost:3005/graphql \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNmEyNWQ0ZjQtNGU5NS00YWQ0LWIzZmQtNjJkMTY0MDQxZDMzIiwicm9sZXMiOlsiZGV2ZWxvcG1lbnQiLCJhZG1pbiJdLCJ0eXBlIjoiYWNjZXNzIiwiaWQiOiI3MWM4YjlhNC05YmNjLTQzYmEtYjg5ZS0wZmNlM2ExMDMzYTIiLCJleHAiOjE1OTE1OTM0MDcsImlzcyI6InZpYXByb2ZpdC1zZXJ2aWNlcyIsImlhdCI6MTU4OTAwMTQwN30.OaT3lMgnanZ-Yz0jUmlQ3pKkNEX5Rnkgw1cXMLX61tD6Z18ngsz-fgm3_g6ZGJqhKrAHCOqK5LeFyYiL_UraUvI-sJDoodyCz2iULGDeR-1iFyL4ULiDs5fRjLkfE26DV2nXjxFL1Bu8mV3nzbS0ArOx6tAzJ3MvKYG5h6RhGCZxmS6DbPd1lr3WEWWNBe7rPHJke6kZtYZhM-q6HNv-T6XCWP32T3KYRD5LUB-Pbgo-0Ybf1aCjT3dICL-CQbXwLmcq3fX329eSZ-1Sg90oJkZhg17mfHwIOVGghvZU7IzUO6dp-vH3P9rGrKR4X5DeU577xpIILRrfFSS-6REvApU0-tYef0LXyXs4oD8iKut4fNE9jUg3Kj4xjXym_eIwLm-vSqQmZmcJtJs63jVTEIKYGevQfPRFlgswHAwOieMA__kLXwfpLr3Dj6arODSuILFLQ2BGb788kACI7nUfbvVtXPkDd4PfqwUHx1NVLrUdwztgGr-ZM5Hu2QS4X8snDc68okrQadxmcRVJys0cbd9vf3tOoZNXle2HiLSSiPrbuLXpEzfrYaqxx8-XRHtsBuPFOQK4zPPlvuU3qvyUSpPUdV9_TYhmAQGob65XOdQ_V3M-gPAVl3tQIzlcDGX08ir3_Z82eMtZNyz5rMq7bmXHVKjjqvrPAH7ZucxOoIs" \
  -i \
  -F operations='{ "query": "mutation ($file: FileUpload!, $info: FileInfo!) {upload{upload(file: $file  info: $info) }}", "variables": { "file": null, "info": {"name": "Some name"} } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@$FILE
