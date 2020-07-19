#!/bin/bash

if [ "$TRAVIS_BRANCH" = "master" ]; then
  ./node_modules/.bin/surge web https://nnor.co
elif [ "$TRAVIS_BRANCH" = "dev" ]; then
  ./node_modules/.bin/surge web https://dev.nnor.co
  ./node_modules/.bin/surge web nnorco.surge.sh
else
  echo "Not in Travis. Files will not be deployed."
fi

