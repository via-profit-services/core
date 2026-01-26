# Roadmap for via-profit-services/core

## 1. Stability & Safety

- **HTTP statuses:**
  - Implement correct HTTP status codes for GraphQL errors:
    - 400 — JSON parse errors
    - 400 — GraphQL parse/validation errors
    - 405 — unsupported HTTP methods
    - 500 — internal runtime errors
- **Timeouts:**
  - Add request read timeouts.
- **GraphQL validation:**
  - Explicitly `parse` and `validate` documents.
  - Add depth limit.
  - Add cost/complexity limit.
- **Logging:**
  - Log GraphQL errors (with safe redaction).
  - Log basic request info (operationName, duration).

## 2. GraphQL over HTTP Spec Compliance

- **GET support:**
  - Support `?query=...`, `?variables=...`, `?operationName=...`.
  - Forbid mutations via GET.
  - Add caching semantics for GET (e.g., `Cache-Control` for pure queries).
- **Content negotiation:**
  - Support `Accept: application/graphql-response+json`.
  - Prefer `application/graphql-response+json` when requested.
- **Content-Type handling:**
  - Properly handle:
    - `application/json`
    - `application/graphql+json`
    - `multipart/form-data`
- **CORS:**
  - Add configurable CORS:
    - `Access-Control-Allow-Origin`
    - `Access-Control-Allow-Headers`
    - `Access-Control-Allow-Methods`
    - Preflight handling (`OPTIONS`).
- **Multipart upload:**
  - Implement full GraphQL multipart request spec:
    - `operations`
    - `map`
    - file streams
  - Define clear error formats and limits.

## 3. Developer Experience Improvements

- **Declarative API:**
  - Introduce higher-level factory, e.g.:
    ```ts
    const server = createGraphQLServer({
      schema,
      context: ({ req, res }) => ({ user: auth(req) }),
      formatError,
      formatResponse,
      uploads: { maxFileSize: 10_000_000 },
      validation: { depth: 10, cost: 5000 },
      logging: { enabled: true },
    });
    ```
- **Unified handler:**
  - Provide `server.handle(req, res)` that:
    - parses body,
    - runs GraphQL,
    - sets status,
    - sets headers,
    - streams JSON response.
- **Documentation:**
  - Add examples for:
    - Node HTTP integration.
    - Express/Fastify adapters.
    - GET queries.
    - Multipart uploads.
    - Custom context.
    - Custom error formatting.
- **TypeScript types:**
  - Strongly type:
    - context factory.
    - upload/file objects.
    - plugin interfaces (если появятся).
  - Export public types for consumers.

## 4. Advanced Features

- **Subscriptions:**
  - Add SSE-based subscriptions endpoint.
  - Optionally add WebSocket (`graphql-transport-ws`) support.
- **Tracing & metrics:**
  - Add hooks for:
    - request start/end.
    - resolver timing.
  - Integrate with OpenTelemetry (optional).
- **Plugins / middleware:**
  - Design plugin API, e.g.:
    ```ts
    const server = createGraphQLServer({
      schema,
      plugins: [
        depthLimitPlugin({ maxDepth: 10 }),
        costLimitPlugin({ maxCost: 5000 }),
        loggingPlugin(),
        authPlugin(),
      ],
    });
    ```
- **GraphiQL / Playground:**
  - Provide optional GraphiQL endpoint with:
    - configurable path,
    - security toggles for production.

## 5. Long-term Goals

- **Full GraphQL over HTTP spec coverage:**
  - Align behavior and defaults with the latest spec.
  - Document all deviations (если будут).
- **Benchmarks:**
  - Add basic benchmarks vs:
    - GraphQL Yoga
    - Mercurius
    - Apollo Server (where comparable)
- **Adapters:**
  - Provide separate packages or modules:
    - `@via-profit/graphql-http-node`
    - `@via-profit/graphql-http-express`
    - `@via-profit/graphql-http-fastify`
    - `@via-profit/graphql-http-cloudflare`
- **Project generator:**
  - CLI или шаблон:
    - минимальный сервис на твоём core,
    - готовый `docker-compose`,
    - пример схемы и резолверов,
    - готовый `ROADMAP.md` и `README.md`.
