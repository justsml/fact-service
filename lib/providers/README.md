# Fact Stores

Assorted database adapters for storing facts.

## TODO

- [x] Postgres
- [x] Redis
- [x] DynamoDB
- [x] Cassandra
- [x] Firestore
- [ ] FoundationDB

## Usage

1. Configure the database adapter using environment variable `DB_ADAPTER`.
1. Set adapter specific environment variables.
1. Start the server.

### TIP

```sh
export LOG_LEVEL=debug
```

## Setup

How to setup local databases for testing.

- Uses container storage, so you can delete the container and start over.
- Uses default ports, feel free to change them.

### Postgres

```sh
export DB_ADAPTER=postgres
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/facts
yarn test

DB_ADAPTER=postgres yarn start
```

```sh
docker run --name facts_postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=facts \
  -p 5432:5432 \
  -d postgres:15-alpine \
  postgres -c 'listen_addresses=*' \
    -c 'password_encryption=scram-sha-256' \
    -c 'shared_memory_type=sysv' \
    -c 'shared_buffers=256MB' \
    -c 'max_connections=200'
```

### Redis

```sh
export DB_ADAPTER=redis
export REDIS_URL=redis://localhost:6379

DB_ADAPTER=redis REDIS_URL=redis://localhost:6379 yarn test
DB_ADAPTER=redis REDIS_URL=redis://localhost:6379 yarn start
```

```sh
docker run --name facts_redis -p 6379:6379 -d redis
```

### DynamoDB

```sh
export DB_ADAPTER=dynamo
export DYNAMO_URL=http://0.0.0.0:4566

DB_ADAPTER=dynamo DYNAMO_URL=http://0.0.0.0:4566 yarn test
DB_ADAPTER=dynamo DYNAMO_URL=http://0.0.0.0:4566 yarn start
```

```sh
docker run --name facts_dynamodb -p 8000:8000 -d amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory -port 8000 -disableTelemetry
```

### Cassandra

```sh
export DB_ADAPTER=cassandra
export CASSANDRA_URL=cassandra://localhost:9042

yarn test

DB_ADAPTER=cassandra CASSANDRA_URL=cassandra://localhost:9042 yarn start
```

```sh
docker run --name facts_cassandra -p 9042:9042 -d cassandra
```

### Firestore

```sh
export DB_ADAPTER=firestore
export FIRESTORE_PROJECT_ID=facts-project
export FIRESTORE_HOST=0.0.0.0
yarn test

DB_ADAPTER=firestore FIRESTORE_PROJECT_ID=facts-project FIRESTORE_HOST=0.0.0.0 yarn start
```

```sh
docker run --name facts_firestore -p 8080:8080 -d \
  -e FIRESTORE_PROJECT_ID=facts-project \
  gcr.io/google.com/cloudsdktool/google-cloud-cli:alpine \
  gcloud beta emulators firestore start --host-port=0.0.0.0:8080
```
