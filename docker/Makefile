#########################################################
# imports
#########################################################

include .env
DATABASE_ROOT_PASS := ${DATABASE_ROOT_PASS}
PHP_PROJECT_ROOT := ${PROJECT_ROOT}

#########################################################
# variables
#########################################################
COMPOSE := docker-compose
UP := $(COMPOSE) up -d
DOWN := $(COMPOSE) down
EXEC = $(COMPOSE) exec $(CONTAINER) bash $(ARG)
CONTAINER =
ARG =

APACHE_ROOT_DIR := /var/www/html
# docker services (container name)
PHP := php
DB := db

#########################################################
# make commands
#########################################################

init:
	@make build up

laravel:
	$(eval CONTAINER := $(PHP))
	$(eval ARG := -c "\
	cd $(PHP_PROJECT_ROOT)/docker && \
	bash shell/laravel-installer.sh\
	")
	@$(EXEC)

build:
	$(eval UID := $(shell id -u))
	$(eval GID := $(shell id -g))
	@$(COMPOSE) build --build-arg PUID=$(UID) --build-arg PGID=$(GID) --no-cache

up:
	@$(UP)

down:
	@$(DOWN)

remove:
	@$(DOWN) --rmi all --volumes --remove-orphans

exec-php:
	$(eval CONTAINER := $(PHP))
	$(eval ARG := -c "cd $(APACHE_ROOT_DIR) && bash")
	@$(EXEC)

exec-php-cmd:
	$(eval CONTAINER := $(PHP))
	$(eval ARG := -c "cd $(PHP_PROJECT_ROOT) && ${CMD}")
	@$(EXEC)

exec-php-tinker:
	@make exec-php-cmd CMD="php artisan tinker"

exec-db:
	$(eval CONTAINER := $(DB))
	$(eval ARG := -c "\
	mysql -u root -p$(DATABASE_ROOT_PASS)\
	")
	@$(EXEC)