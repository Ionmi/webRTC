export ARGS

all:
	-docker-compose up --build

dev:
	-docker-compose -f docker-compose.dev.yml up --build

stop:
	-docker-compose -f docker-compose.dev.yml stop

down:
	-docker-compose -f docker-compose.yml down
	-docker-compose -f docker-compose.dev.yml down

.SILENT:
rmc:
	-docker rm -f $$(docker ps -qa)

rmi:
	-docker rmi -f $$(docker images -qa)

rmv:
	-docker volume rm -f $$(docker volume ls -q)

rmn:
	-docker network rm -f $$(docker network ls -q) 2>/dev/null

fclean: down rmc rmi rmv rmn
	-docker system prune -a --force


# clean_volumes:
# 	-rm -rf /Users/ioromero/Desktop/level_6/volumes/db/*
# 	-rm -rf /Users/ioromero/Desktop/level_6/volumes/api/*
# 	-rm -rf /Users/ioromero/Desktop/level_6/volumes/client/*

re: fclean all

.PHONY: all dev fclean re stop down rm_containers rm_images rm_volumes rm_networks clean_volumes