#!/usr/bin/env bash

source ../.env
NODE_VERSION=${NODE_VERSION}
#
curl https://get.volta.sh | bash
export VOLTA_HOME=$HOME/.volta
export PATH=$PATH:$VOLTA_HOME/bin
# volta のインストールまではこれでできたけど、node のインストールはできなかった
# shellcheck disable=SC1090
source ~/.bashrc
volta install node@"$NODE_VERSION"

echo node------------------------------------------------------------------------------------------
echo
echo "$NODE_VERSION"
echo
echo ------------------------------------------------------------------------------------------node
