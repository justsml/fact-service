# Fact Service

> A Nodejs, TypeScript, Express & Knex Project

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Create `.env.local` file](#create-envlocal-file)
  - [Initialize Database](#initialize-database)
  - [Start Service](#start-service)
- [Testing](#testing)
  - [Creating Facts](#creating-facts)
  - [Query Facts](#query-facts)
  - [Updating Facts](#updating-facts)
- [TODO](#todo)
  - [Features \& Patterns](#features--patterns)
  - [Security \& Correctness](#security--correctness)

## Overview

The [`FactService`](lib/factService/types.ts#L16) interface helps keep two modules aligned - [the database client](/lib/factService/clientDb.ts) and the [Axios HTTP client API](/lib/factService/clientApi.ts). _The HTTP API is portable and can be used in any JS/TS project._

The database schema & configuration is implemented using a Knex migration. Check it out in [the `./db/migrations` directory](/db/migrations/20221030233239_fact_store.js).

The rest of this README will get you up and running locally.

## Getting Started

### Create `.env.local` file

Copy the `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Configure access with the `ALLOWED_TOKENS` environment variable. This is a space-separated set of API tokens that grant access to the service.

Edit any environment variables as needed.

### Initialize Database

```sh
mkdir -p $HOME/.postgres-data
docker run \
  --name facts-database \
  -v $HOME/.postgres-data:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  -e 'POSTGRES_PASSWORD=tru3ted' \
  --restart on-failure:5 \
  --detach \
  --shm-size=256mb \
  arm64v8/postgres:14.5-alpine \
  postgres -c 'listen_addresses=*' \
    -c 'password_encryption=scram-sha-256' \
    -c 'shared_memory_type=sysv' \
    -c 'shared_buffers=256MB' \
    -c 'max_connections=200'
```

### Start Service

```sh
npm install
npx knex migrate:latest
npm start
```

> To learn more about database workflows and how to use the Knex CLI, check out the [README_DB.md](/README_DB.md) file.

## Testing

### Creating Facts

#### A Fact with a JSON Value

```sh
curl --request PUT \
  --url http://127.0.0.1:3000/api/facts \
  --header 'Content-Type: application/json' \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --data '{
  "path": "user",
  "key": "456",
  "value": 42
}'
```

```sh
curl --request PUT \
  --url http://127.0.0.1:3000/api/facts \
  --header 'Content-Type: application/json' \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --data '{
  "path": "user",
  "key": "789",
  "value": "{\"json\": true}"
}'
```

### Query Facts

#### All Facts matching path and multiple keys

```sh
curl --request GET \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --url 'http://127.0.0.1:3000/api/facts?path=user&key=123%2C456'
```

#### Get the count for every unique path

```sh
curl --request GET \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --url 'http://127.0.0.1:3000/api/facts/stats/path-count'
```

```json
{
  "user": "3",
  "user_credits": "2"
}
```

#### Get all Facts matching a path

Finds all Facts matching the path `user`.

```sh
curl --request GET \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --url http://127.0.0.1:3000/api/facts/user
```

Finds all Facts matching the path `user/overrides`.

```sh
curl --request GET \
  --header 'x-token: 527E0695-0000-0000-0000-46BEA59C9294' \
  --url http://127.0.0.1:3000/api/facts/user%2Foverrides
# Note the URI Escaped path: user%2Foverrides (i.e. user/overrides)
```

### Updating Facts

```sh
curl --request POST \
  --url http://127.0.0.1:3000/api/facts/3 \
  --header 'Content-Type: application/json' \
  --data '{
  "path": "user",
  "key": "456",
  "value": "{\"json\": true, \"updated\": \"🚀\"}"
}'
```

## TODO

- [ ] Convert this to yarn workspaces (Monorepo). Add `fact-editor` project, deployment, etc.

### Features & Patterns

- [ ] Add Dockerfile & compose configs.
  - [ ] Set up ECS + Fargate deployment. (Terraform? CDK? CFN?)
- [ ] Make API more RESTful.
  - [ ] Use `PUT` & `POST` (`PATCH`?) for creating and updating Facts.
  - [ ] Use `GET` for querying Facts.
  - [ ] Use `DELETE` for deleting Facts.
  - [x] Add an API method to get stats on unique `paths` with the # of keys per path.
    - [ ] Add router for `/stats` to access aggregate stats. Currently, only unique key counts per path are available.
- [ ] Consider a check restricting reserved paths & prefixes (e.g. `/!operation-name`, `admin`, `stats`, `health`, etc.)
- [ ] Add Zod Validation?
- [x] Add example [HTTP API Client.](/lib/factService/clientApi.ts)
- [ ] Add Integration Tests.
- [ ] Add unit tests for pure functions.

### Security & Correctness

- [x] Configurable Token / API Key. (for now, use `process.env.ALLOWED_TOKENS`.)
- [ ] Enforce consistent `path` separators (e.g. `_`, `/` or `.`)
  - [ ] Configure with `PATH_SEPARATOR` env var.
  - [ ] Set `PATH_SPLIT_PATTERN` to a char sequence which will be replaced by `PATH_SEPARATOR`.
