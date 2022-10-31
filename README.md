# Fact Service

> Reference Nodejs, TypeScript & Knex Project

## Setup dotenv

Copy your `.env.example` to `.env`.

## Setup Database

```sh
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

## Testing the Service

