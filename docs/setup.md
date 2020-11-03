# Установка и настройка

> Via Profit services / **Core**

## Установка

В некоторых миграциях встречается импорт `uuid`, поэтому вам придется установить этот пакет вместе с `@via-profit-services/core`

```bash
yarn add uuid @via-profit-services/core
yarn add --dev @types/uuid
```

**Примечание:** При использовании сидов вам придется установить `faker` и `bcryptjs`:

```bash
yarn add --dev bcryptjs @types/bcryptjs faker @types/faker
```

## Настройка

Для работы [JWT](https://github.com/auth0/node-jsonwebtoken) необходимо сгенерировать SSH-ключи используя алгоритм, например, `RS256`.

**Замечание:** При запросе `passphrase` просто нажмите _Enter_ для того, чтобы этот параметр остался пустым. То же самое необходимо сделать при подтверждении `passphrase`.

Создайте директорию `keys` и сгенерируйте в ней ключи выполнив команды:

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

После выполнения команд будут создан приватный ключ(`jwtRS256.key`) и публичный ключ (`jwtRS256.key.pub`)