#!/bin/bash

set -exo pipefail
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [[ -n "${CI}" ]]; then
	echo "DB is started by CI"
else
	echo "Starting DB"
	docker-compose  --project-directory "${SCRIPT_DIR}/.." up -d
	"$SCRIPT_DIR/waitForPg.sh"
	docker-compose exec -T sst-local-db dropdb -U postgres --if-exists tests
	docker-compose exec -T sst-local-db createdb -U postgres tests
fi

