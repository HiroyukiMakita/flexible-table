# flexible-table

# Getting started

```
$ cd docker
# Docker 用の .env を生成後、各値を設定
$ cp .env.example .env
$ make
$ make exec-php
/var/www/html# composer install
# Laravel の .env を生成後、DB の値を設定
/var/www/html# cp .env.example .env
/var/www/html# php artisan key:generate
/var/www/html# php artisan migrate --seed
```

- [Laravel: http://localhost:8080](http://localhost:8080)
- [PHPMyAdmin: http://localhost:8888](http://localhost:8888)
