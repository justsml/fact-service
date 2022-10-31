# Fact Service

> Reference Nodejs, TypeScript, Express & Knex Project

- [Introduction](#introduction)
- [Setup](#setup)
  - [Create `.env` file](#create-env-file)
  - [Initialize Database](#initialize-database)
- [Start Service](#start-service)
- [Testing](#testing)
  - [Creating Facts](#creating-facts)
  - [Query Facts](#query-facts)
  - [Updating Facts](#updating-facts)
- [Usage Notes](#usage-notes)
  - [Fact type reference](#fact-type-reference)
- [TODO](#todo)

## Introduction

The two most interesting parts of this project are [the database client](/lib/factService/clientDb.ts) and the [HTTP API client](/lib/factService/clientApi.ts).

The rest of this README will get you up and running locally.

## Setup

### Create `.env` file

Copy the `.env.example` to `.env`.

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

## Start Service

```sh
npm install
npm start
```

## Testing

### Creating Facts

#### A Fact with a JSON Value

```sh
curl --request PUT \
  --url http://127.0.0.1:3000/api/facts \
  --header 'Content-Type: application/json' \
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
  --url 'http://127.0.0.1:3000/api/facts?path=user&key=123%2C456'
```

#### Get all Facts matching a path

Finds all Facts matching the path `user`.

```sh
curl --request GET \
  --url http://127.0.0.1:3000/api/facts/user
```

Finds all Facts matching the path `user/overrides`.

```sh
curl --request GET \
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

## Usage Notes

The client library to interact with [the database](/lib/factService/clientDb.ts) and [HTTP endpoints](/lib/factService/clientApi.ts) is implemented following this interface:

```ts
export interface FactClient {
  findById: (id: number | bigint) => Promise<Fact>;
  findFactsByPathKeys: (
    query: IFactServiceQuery & IQueryParameters,
  ) => Promise<Fact[]>;
  findAllFactsByPath: (
    query: { path: string } & IQueryParameters,
  ) => Promise<Fact[]>;
  create: (data: Omit<Fact, "id">) => Promise<Fact[]>;
  update: (data: Fact) => Promise<Fact[]>;
  removeById: (id: number | bigint) => Promise<{ message: string }>;
}
```

### Fact type reference

```ts
export type Fact = {
  id: number | bigint | string;
  path: string;
  key: string;
  value: object;
  created_at?: Date;
  updated_at?: Date;
};
```

## TODO

- [ ] Add Zod Validation.
- [ ] Add HTTP API Client.
- [ ] Add HTTP API Tests.
- [ ] Add Integration Tests.
