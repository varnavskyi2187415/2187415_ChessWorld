#/bin/sh

docker compose down
docker compose up -d

./local_recreate.sh