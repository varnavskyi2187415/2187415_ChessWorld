#/bin/sh

GREEN='\033[0;32m'
NC='\033[0m' 

docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
echo -e "=======================${GREEN}FINISHED!${NC}==========================="