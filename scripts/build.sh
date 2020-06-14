#!/bin/bash

set -e # Bail out on first error.

rm -rf tmp web
mkdir tmp web
cat src/data.json
curl -u $GITHUB_AUTH_USER:$GITHUB_AUTH_KEY https://api.github.com/repos/connor-bracewell/nnorco/commits > tmp/commit.json
cat tmp/commit.json
./node_modules/node-jq/bin/jq ".commit_date=\"$(date "+%m/%Y")\"" src/data.json > tmp/data2.json
cat tmp/data2.json
./node_modules/node-jq/bin/jq ".commit_hash=$(cat tmp/commit.json | ./node_modules/node-jq/bin/jq .[0].sha[0:7])" tmp/data2.json > tmp/data3.json
cat tmp/data3.json
./node_modules/node-jq/bin/jq  ".commit_url=$(cat tmp/commit.json | ./node_modules/node-jq/bin/jq .[0].html_url)" tmp/data3.json > tmp/data4.json
cat tmp/data4.json
mustache tmp/data4.json src/index.mustache > web/index.html
cp src/404.html web
mkdir web/js
tsc --lib "es2015,dom" --outFile web/js/main.js src/ts/main.ts
cp -r src/js/* web/js
cp -r src/img web
mkdir web/burger
cp src/burger.html web/burger/index.html
mkdir web/css
sass src/sass/style.scss > web/css/style.css
sass src/sass/bin4features.scss > web/css/bin4features.css
rm -rf tmp
