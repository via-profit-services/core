# Загрузка файлов

Ядро поддерживает [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec). Это тот же протокол, что у `apollo-upload-client`, `urql` и других клиентов.

## Как это работает

1. Клиент отправляет `multipart/form-data` из трёх частей, **строго в этом порядке**:
   - `operations` — JSON запроса, в переменных вместо файлов стоит `null`;
   - `map` — какой файл в какую переменную подставить;
   - сами файлы.
2. Ядро **потоком** записывает каждый файл во временный файл на диске. Память не зависит от размера файла.
3. Все [лимиты](./configuration.md#загрузка-файлов-multipart) проверяются по мере чтения. При превышении запрос сразу отклоняется.
4. Запрос выполняется, когда все файлы полностью записаны. Если файл указан в `map`, но не пришёл, клиент получает ошибку.
5. Резолвер получает файл через скаляр `FileUpload`.
6. **После отправки ответа временные файлы удаляются автоматически.**

## Схема

```ts
import { GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString, GraphQLInt } from 'graphql';
import { FileUploadScalarType, type UploadedFile } from '@via-profit-services/core';

const UploadResult = new GraphQLObjectType({
  name: 'UploadResult',
  fields: {
    filename: { type: new GraphQLNonNull(GraphQLString) },
    size: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    uploadFiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UploadResult))),
      args: {
        files: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FileUploadScalarType))),
        },
      },
      resolve: async (_parent, args: { files: UploadedFile[] }) => {
        // UploadedFile — это Promise<FilePayload>
        const files = await Promise.all(args.files);

        return Promise.all(
          files.map(async file => {
            await saveToStorage(file); // см. ниже
            return { filename: file.filename, size: file.fileSize };
          }),
        );
      },
    },
  },
});
```

## `FilePayload`

| Поле | Описание |
|------|----------|
| `filename` | Имя файла от клиента: только имя, без пути, без управляющих символов. Поддерживается кириллица (`filename*=UTF-8''…`) |
| `mimeType` | Тип из заголовка части в нижнем регистре без параметров (`image/png`). По умолчанию `application/octet-stream` |
| `encoding` | `Content-Transfer-Encoding` части, обычно `7bit` |
| `fileSize` | Точный размер файла в байтах |
| `createReadStream(options?)` | Поток чтения файла. Можно вызывать несколько раз |
| `cleanup()` | Удалить временный файл сейчас. Необязателен: ядро удалит его само |

> ⚠️ **Не доверяйте `filename` и `mimeType`.** Их присылает клиент. Не используйте
> `filename` как путь на сервере, а тип файла проверяйте по содержимому
> (например, пакетом `file-type`).

## Сохранение файла

```ts
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import type { FilePayload } from '@via-profit-services/core';

const saveToStorage = async (file: FilePayload) => {
  // имя генерируем сами, а не берём от клиента
  const name = `${crypto.randomUUID()}${path.extname(file.filename).toLowerCase()}`;
  const destination = path.join(STORAGE_DIR, name);

  // pipeline передаёт ошибки и закрывает потоки при любом исходе
  await pipeline(file.createReadStream(), fs.createWriteStream(destination));

  return destination;
};
```

Загрузка в S3 и подобные хранилища устроена так же: передайте `file.createReadStream()` как тело запроса SDK.

## Временные файлы

- Хранятся в `os.tmpdir()` с именами `via-profit-upload-<uuid>`. Права `0600`, создаются эксклюзивно.
- Удаляются, когда закрывается HTTP-ответ (событие `close` у `http.ServerResponse`). Это происходит и при успешной отправке, и при обрыве соединения.
- **Прочитайте или скопируйте файл до отправки ответа.** Если резолвер запускает фоновую обработку и сразу возвращает результат, фоновая задача должна сначала скопировать файл в своё хранилище.
- Если процесс упал посреди загрузки, файлы останутся в `/tmp` (обычно его чистит ОС).

## Ошибки

| Ситуация | Сообщение |
|----------|-----------|
| Превышен размер файла | `File «photo.png» exceeds the 10485760 byte size limit` |
| Превышен суммарный размер | `Total upload size exceeds the … byte size limit` |
| Слишком много файлов / частей / полей | `Multipart request exceeds the limit of N files` / `parts` / `non-file field parts` |
| Файл из `map` не пришёл | `File «0» is referenced in the «map» multipart field, but was not received` |
| Файл, которого нет в `map` | `File «1» is not referenced in the «map» multipart field` |
| Неверный порядок частей | `The «map» multipart field must come after the «operations» field` |
| Запрос оборван клиентом | `The request was aborted by the client` |
| Тело с переводами строк LF вместо CRLF | `Malformed multipart body: …` |

При любой ошибке временные файлы удаляются, а чтение тела прекращается: ядро не скачивает остаток, если файл заведомо не пройдёт лимит.

## Запрос вручную (curl)

```bash
curl http://localhost:8080/graphql \
  -F operations='{"query":"mutation($files: [FileUpload!]!) { uploadFiles(files: $files) { filename size } }","variables":{"files":[null]}}' \
  -F map='{"0":["variables.files.0"]}' \
  -F 0=@photo.png
```

С включённым [`csrfPrevention`](./security.md#csrfprevention) добавьте `-H 'apollo-require-preflight: true'`.

## Прогресс загрузки на клиенте

Прогресс **отправки** знает только клиент: браузер видит, сколько байт ушло в сеть. Сервер ответит только после получения всего запроса, поэтому для полосы прогресса серверная часть не нужна.

`fetch()` в браузерах не сообщает о прогрессе отправки, поэтому используется `XMLHttpRequest`:

```ts
type Progress = { loaded: number; total: number; percent: number };

export function uploadWithProgress(
  url: string,
  query: string,
  files: File[],
  onProgress: (progress: Progress) => void,
): { promise: Promise<unknown>; abort: () => void } {
  const form = new FormData();
  form.append('operations', JSON.stringify({ query, variables: { files: files.map(() => null) } }));
  form.append('map', JSON.stringify(Object.fromEntries(files.map((_, i) => [i, [`variables.files.${i}`]]))));
  files.forEach((file, i) => form.append(String(i), file, file.name));

  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.open('POST', url);
    xhr.withCredentials = true;                               // если авторизация на cookie
    xhr.setRequestHeader('apollo-require-preflight', 'true'); // для csrfPrevention
    // Content-Type не задаём: браузер добавит multipart/form-data с boundary сам

    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new Error('Upload aborted'));
    xhr.send(form);
  });

  return { promise, abort: () => xhr.abort() };
}
```

```ts
const upload = uploadWithProgress(
  '/graphql',
  'mutation($files: [FileUpload!]!) { uploadFiles(files: $files) { filename } }',
  Array.from(input.files ?? []),
  ({ percent }) => (progressBar.value = percent),
);

cancelButton.onclick = upload.abort; // ядро корректно обработает обрыв и удалит временные файлы
const result = await upload.promise;
```

100% прогресса означает, что байты отправлены, а не что сервер их обработал. После 100% показывайте состояние «Обработка…» до прихода ответа.

С Apollo Client и `apollo-upload-client` тот же результат даёт своя функция `fetch` на основе `XMLHttpRequest`, переданная в `createUploadLink({ fetch })`.

### Прогресс обработки на сервере

Если долгой является не передача, а **обработка** файла (конвертация, распознавание), прогресс отдаётся отдельным каналом:

1. клиент генерирует `uploadId` и передаёт его в переменных мутации;
2. резолвер публикует ход обработки в канал этого `uploadId` (GraphQL subscription, SSE, Redis pub/sub);
3. клиент слушает канал параллельно с запросом.

```ts
resolve: async (_parent, { file, uploadId }: { file: UploadedFile; uploadId: string }) => {
  const { createReadStream, fileSize } = await file;
  let processed = 0;

  for await (const chunk of createReadStream()) {
    processed += chunk.length;
    await processChunk(chunk);
    progressBus.publish(uploadId, { processed, total: fileSize });
  }

  return { ok: true };
}
```
