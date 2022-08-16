#!/bin/bash

set -exo pipefail
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )


if [[ -n "${CI}" ]]; then
	echo "Running migrations in CI"
	pnpm exec prisma migrate deploy
else
	echo "Starting DB and running migrations"
	docker-compose  --project-directory "${SCRIPT_DIR}/.." up --force-recreate -d
	"$SCRIPT_DIR/waitForPg.sh"
	docker-compose exec -T local-db dropdb -U postgres --if-exists tests
	docker-compose exec -T local-db createdb -U postgres tests
fi

