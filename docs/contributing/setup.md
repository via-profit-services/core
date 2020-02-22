# Установка и настройка

В качестве основного пакетного менеджера используется [yarn](https://yarnpkg.com/), но все действия возможно выполнять и с [npm](https://www.npmjs.com/get-npm)

## Установка

Склонируйте репозиторий и установите зависимости

```bash
git clone git@gitlab.com:via-profit-services/core.git @via-profit-services/core
cd @via-profit-services/core
yarn
```

## Настройка

1. Для работы [JWT](https://github.com/auth0/node-jsonwebtoken) необходимо сгенерировать SSH-ключи используя алгоритм, например, `RS256`.

**Замечание:** При запросе `passphrase` просто нажмите _Enter_ для того, чтобы этот параметр остался пустым. То же самое необходимо сделать при подтверждении `passphrase`.

В корне проекта (на том же уровне, что и `package.json`) создайте директорию `cert` 

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```
После выполнения команд будут создан приватный ключ(`jwtRS256.key`) и публичный ключ (`jwtRS256.key.pub`) 

2. Для хранения реквизитов доступа и прочих настроек, зависящих от устройства, на котором разрабатывается и запускается проект, используется [DotEnv](https://github.com/motdotla/dotenv).

В корне проекта (на том же уровне, что и `package.json`) создайте файл `.env` со следующим содержимым:

```dosini
PORT=4000

GQL_ENDPOINT=/graphql
GQL_SUBSCRIPTIONSENDPOINT=/subscriptions

DB_CLIENT=pg
DB_HOST= <-- Хост базы данных
DB_USER= <-- Имя пользователя базы данных
DB_NAME= <-- Название базы данных
DB_PASSWORD= <-- Пароль базы данных

JWT_ALGORITHM=RS256
JWT_ACCESSTOKENEXPIRESIN=1800
JWT_REFRESHTOKENEXPIRESIN=2.592e6
JWT_ISSUER=viaprofit-services
JWT_PRIVATEKEY=./keys/jwtRS256.key
JWT_PUBLICKEY=./keys/jwtRS256.key.pub
```