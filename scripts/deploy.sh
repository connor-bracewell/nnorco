#!/bin/bash

if [ "$TRAVIS_BRANCH" = "master" ]; then
  surge web https://nnor.co
elif [ "$TRAVIS_BRANCH" = "dev" ]; then
  surge web https://dev.nnor.co
  surge web nnorco.surge.sh
else
  echo "Not in Travis. Files will not be deployed."
fi

