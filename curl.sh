#!/bin/bash

curl 'http://localhost:9001/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: altair://-' -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNjVlNmRhYzUtNjhjOC00ZjBlLWI3MjktYzA3MTYzZjA3MzA3Iiwicm9sZXMiOlsiZGV2ZWxvcGVyIl0sInR5cGUiOiJhY2Nlc3MiLCJpZCI6ImJjOTdjZGFmLWIzZTQtNDdhMS05NGE2LTI5YTVjMmQ4YTk2ZCIsImV4cCI6MTYxMDg4ODg3NCwiaXNzIjoidmlhcHJvZml0LXNlcnZpY2VzIiwiaWF0IjoxNjA4Mjk2ODc0fQ.KTRUDhJRshxBBuVhHXT7q_E0AD6I5hrF7Vpeqiuz_IymoCOiK3M5Rwzg2tNM7KLRVLEpJ13Q-GO6Usuzk3FI729obqqgyaP0LlrsL-KFyUobCJ6QNdrMtd8_SzY3cTGZlLRvO5G865bT-wTAgDuIAQ71w71KslEaxQwA5iRIBxY-SJo673HsdxRxl0NYZFf5iAgog2NIHE9YGEnQ-bz2CR-8WXykhQN3wZ1ewoNUwOMghDAJhW6bwTvQ3uCrkzCK022XOIq7HjiVVSDMdZCOLkEYxo7Yxev043_3mITsDXpC0wfXPg8DOwhcCepVDSU3GrqtIz3u6Efxj2q8mv09HyXm79ALiOu42CY00QfmvL-mfVozx3ggUQNmfy-NIkd9OfEtRZ30ZbpNGaFozlIlbDC0EneDX86hZ1aBd_2cbC2hX69GvZ9XftXb_tPA1-NNYAgEVVS6Nk_5RbQRPXryfDJJo2H5M2h9-PVwofAi1ICzNda04JxPH3k2GzUb2uX7maG7uip7OGtI3i8PB127IxBsov8Njd9vaw5nJ9-1qABHdG1roe2JnXbnKFnIcVZAqnhZnpVcvv2dcOuEB3pnJ5BElV4qxy1cbOjReJRQ9RfrU3bv-6tfntyAJRrX3-nh1hpn7vWUbTnC5_EjS6eBDZsZB3ASgnAyL4Enbn7T4aE' --data-binary '{"query":"mutation uploadSingleFile($files: [FileUpload!]!, $info: [FileUploadInfo!]!) {\n  fileStorage {\n    upload(files: $files, info: $info) {\n      id\n      mimeType\n      url\n    }\n  }\n}\n","variables":{"files":[0],"info":[{"id":"15ec12f3-bab2-458c-a04d-32b581fa589c","owner":"6c45cbf9-4e83-4e8a-be89-def81c66c7e7","category":"Some files"}]}}' --compressed \
  -F map='{ "0": ["variables.files.0"] }' \
  -F 0=@/home/dhs/Pictures/Me.jpg


# curl 'http://localhost:9005/graphql' \
#   -H 'Accept-Encoding: gzip, deflate, br'  \
#   -H 'Content-Type: application/json'  \
#   -H 'Accept: application/json'  \
#   -H 'Connection: keep-alive'  \
#   -H 'Origin: altair://-'  \
#   -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYzk5YmFmOGYtYWRjYS00NDkzLThlMzctZDYzYzBhYTBhZjMxIiwicm9sZXMiOlsiYWRtaW4iLCJkZXZlbG9wZXIiXSwidHlwZSI6ImFjY2VzcyIsImlkIjoiODU5M2I3MWEtNTVmNC00YjUwLTk1ZmYtNWNiOGMxZTAyOTMzIiwiZXhwIjoxNjA4MjkyNDczLCJpc3MiOiJ2aWFwcm9maXQtc2VydmljZXMiLCJpYXQiOjE2MDgyOTA2NzN9.qjSvPU2zA39TQRS60C17b_zlugcGA4uO5BIGFoppGpsZvNniKbAvs2mjnrgrooJ00SRa0_aB_qVFbnqdbBWSGt0l1VzZHrGuGHoT-xBOhYFn3k_BTf71Id0Rs2OBJfM3_BRVu9fbPS3GIMxby9GcrI554PlD5akdtwGsCDiEOzvWZcZOEHpGsITzSW09RKIJI-UAckb2rEnc7YqaokxR8WcaKKnWrOa5cZDhhSl6iomiaZGMaDrYEAKSOQu43Hn_WuEtV_5sb3K5s1AYE2nYqeEUSspGUEXP7vqLTYVgojxXJrlL86VYntzSg8fWO9r8PGTh_eATon3dclNh-wo2lDmIZ8wMAHDyoj4FE8OR3FiFxnUGX_8Ovmc8NqpyTCH87o0U3pdKjQ2G8cz8jPTIGfLCDE7ggM2zLsX2ESasHYg_vTrXgakLeWpNyPezFosA48N_GKKcSxqHskbxCMuHLF-E-Qj3jnAY9ssT-KBmvzUae88GQE2oDbutLpGRoPBmDDqkLaa1oXTB3JWw4QdGySHXxz9FQ14nsdtiBKx7y9ydKKGQhYeHHipHh7GibRAxX587JqIWYmNhvt7OZTAvFGv7lTB8hfT63o7Pa-LXta58Vsbj0RgiNY-6I8oyXGR2-5FgDFWGnJSqOGztwqoAzSmosz0bFii2sZfYkWhQfhM' \
#   --data-binary '{"query":"query {info{developer{name}}}","variables":{}}' \
#   --compressed