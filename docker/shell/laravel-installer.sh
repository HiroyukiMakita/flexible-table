#!/usr/bin/env bash

source .env
LARAVEL_VERSION=${LARAVEL_VERSION}
PROJECT_ROOT=${PROJECT_ROOT}

# Run in php container.
echo "Laravel version to install is $LARAVEL_VERSION ."
composer create-project --prefer-dist laravel/laravel laravel-app "$LARAVEL_VERSION.*"
shopt -s dotglob
mv -n laravel-app/* "$PROJECT_ROOT"
shopt -u dotglob
rm -r laravel-app

#chmod -R go+w $PROJECT_ROOT/storage/
#chmod -R go+w $PROJECT_ROOT/bootstrap/cache/

# laravel mix
#composer require laravel/ui
#npm install -g yarn
#yarn install
