#!/bin/bash

set -e

function testcmd {
  docker-compose exec -T local-db psql -U postgres -c "select 'postgres is alive'"
}

TRIES=0
until testcmd; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep .4

  TRIES=$((TRIES + 1))
  if [ "$TRIES" -gt "10" ]; then
    >&2 echo "Postgres is unavailable - giving up"
    exit 1
  fi
done

>&2 echo "Postgres is up - continuing"
exit 0
