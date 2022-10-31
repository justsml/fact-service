# Fact Service

> Reference Nodejs, TypeScript, Express & Knex Project

## Setup dotenv

Copy your `.env.example` to `.env`.

## Setup Database

```sh
mkdir -p $HOME/.postgres-data
docker run \
  --name pg-server \
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

## Start Service Locally

```sh
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

```sh
curl --request GET \
  --url http://127.0.0.1:3000/api/facts/user
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
