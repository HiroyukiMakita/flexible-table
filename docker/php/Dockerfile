ARG PHP_IMAGE_VERSION
FROM php:${PHP_IMAGE_VERSION}

ENV COMPOSER_ALLOW_SUPERUSER 1
ENV COMPOSER_HOME /composer
ENV PATH ${PATH}:/composer/vendor/bin
ENV LANG C.UTF-8
ENV LANGUAGE en_US:

ARG XDEBUG_VERSION
ARG NODE_VERSION

RUN apt-get update \
#  && curl -sL https://deb.nodesource.com/setup_${DEFAULT_NODE_VERSION}.x | bash - \
  && apt-get install -y libzip-dev zlib1g-dev unzip vim zip libpq-dev libonig-dev \
  # Dockerコンテナ内でIlluminate\Http\UploadedFileクラスを利用するには PHP GD が必要
  libpng-dev libjpeg-dev libicu-dev \
#  && npm install -g npm \
  && pecl install xdebug${XDEBUG_VERSION} apcu \
  && echo "extension=apcu.so" > ${PHP_INI_DIR}/conf.d/apcu.ini \
#  && docker-php-ext-install xdebug \
  && docker-php-ext-enable xdebug \
  # Dockerコンテナ内でIlluminate\Http\UploadedFileクラスを利用するには PHP GD が必要
  && docker-php-ext-configure gd \
  && docker-php-ext-install gd zip pdo_mysql bcmath intl mbstring opcache intl \
  # composer
  && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('sha384', 'composer-setup.php') === trim(file_get_contents('https://composer.github.io/installer.sig'))) { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
  && php composer-setup.php \
  && php -r "unlink('composer-setup.php');" \
  && mv composer.phar /usr/local/bin/composer \
  && composer global require laravel/installer \
  # Clear cache
  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ./shell/setup-volta.sh /var/www/html/docker/shell/setup-volta.sh
RUN chmod 0744 /var/www/html/docker/shell/setup-volta.sh \
  && /var/www/html/docker/shell/setup-volta.sh

# port
EXPOSE 22 80 443
