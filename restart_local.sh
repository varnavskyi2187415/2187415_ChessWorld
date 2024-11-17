#/bin/sh

docker stop $(docker ps -aq); docker system prune -f

./local_recreate.sh