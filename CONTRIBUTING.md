# Участие в разработке

## Окружение

- Node.js 20+ (пакет поддерживает 18.18+)
- `npm ci`

## Команды

| Команда | Что делает |
|---------|-----------|
| `npm test` | Тесты (Jest) |
| `npm run lint:check` | ESLint без исправлений, предупреждения считаются ошибками |
| `npm run lint` | ESLint с автоисправлением |
| `npm run typecheck` | Проверка типов TypeScript |
| `npm run build` | Сборка `dist/` (ESM + CJS + `index.d.ts`) |

CI (`.github/workflows/ci.yml`) выполняет все проверки на Node.js 18, 20, 22 и 24.

## Структура

Код сгруппирован по предметным областям. Публичные типы лежат рядом с кодом в `types.ts` каждой области и экспортируются из `src/index.ts`. `dist/index.d.ts` генерируется при сборке (`rollup-plugin-dts`) одним файлом: иначе не сработает `declare module '@via-profit-services/core'` для `Context` в проектах.

```
src/
  index.ts                публичный API: всё, что экспортируется отсюда, попадает в пакет
  constants.ts            значения по умолчанию (экспортируются)
  application/            обработчик запроса
    index.ts              фабрика и весь путь запроса по шагам
    build-config.ts       конфиг со значениями по умолчанию
    document-cache.ts     кэш разобранных и проверенных документов
    request-state.ts      состояние одного запроса
    request-errors.ts     ошибки разбора запроса и выбор HTTP-статуса
    limits-usage.ts       замеры использования лимитов
  http/                   HTTP-уровень
    assert-request-allowed.ts  метод, Content-Type, CSRF
    body-parser.ts        чтение тела, параметры запроса
    content-type-parser.ts, body-stats.ts
  uploads/                загрузка файлов
    multipart.ts          потоковый парсер multipart/form-data
    multipart-headers.ts  заголовки части, Content-Disposition, имя файла
    graphql-file-uploader.ts  протокол загрузки файлов поверх парсера
    file-upload-instance.ts, temp-file.ts
    map-path.ts           безопасная подстановка файлов в variables
  validation/             правила глубины и сложности
  middleware/             запуск middleware
  extensions/             поля `extensions` ответа (setExtension, requestId)
  errors/                 ServerError, HttpError, форматирование и маскирование ошибок
  connection/             курсорная пагинация
  schema/                 скаляры, input-типы, интерфейсы, fieldsWrapper
  utils/                  общие мелочи без предметной области (LRU-кэш, isPlainObject)
  __test__/               тесты
```

## Правила

- **Тесты обязательны** для исправлений и новых возможностей. Для исправления ошибки сначала напишите тест, который её воспроизводит.
- **Состояние запроса** создаётся внутри обработчика запроса. В фабрике и в замыканиях живёт только то, что одинаково для всех запросов (схема, конфиг, кэши с ограничением размера).
- **Данные клиента** не используются как ключи объектов без `Object.hasOwn` / `Object.create(null)` / `Map`.
- **Синхронные операции ФС** (`*Sync`) в пути обработки запроса запрещены: они блокируют все запросы.
- **Публичный API** (экспорты, параметры, типы) меняется только с записью в CHANGELOG. Ломающие изменения — только в мажорной версии.
- Типы пишутся в коде (`*/types.ts`, JSDoc у экспортируемых функций): из них генерируется `dist/index.d.ts`. При изменении параметров обновляйте JSDoc и документацию в `docs/`.
- Коммиты в стиле [Conventional Commits](https://www.conventionalcommits.org/ru/): `fix: …`, `feat: …`, `perf: …`, `docs: …`, `test: …`, `chore: …`.

## Уязвимости

Не публикуйте их в issues — см. [SECURITY.md](./SECURITY.md).
