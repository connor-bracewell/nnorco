#!/bin/bash

set -e  # exit on error
rm -rf tmp web
mkdir tmp web

# index.html
# cat src/data.json
curl "https://api.github.com/repos/connor-bracewell/nnorco/commits?path=src&per_page=1" > tmp/commit.json
node-jq ".commit_date=$(cat tmp/commit.json | node-jq .[0].commit.committer.date[0:7])" src/data.json > tmp/data2.json
node-jq ".commit_hash=$(cat tmp/commit.json | node-jq .[0].sha[0:7])" tmp/data2.json > tmp/data3.json
node-jq ".commit_url=$(cat tmp/commit.json | node-jq .[0].html_url)" tmp/data3.json > tmp/data4.json
mustache tmp/data4.json src/index.mustache > web/index.html

# 404.html
cp src/404.html web

# /js
mkdir web/js
tsc --lib "es2015,dom" --outFile web/js/main.js src/main.ts

# /img
cp -r src/img web

# /css
mkdir web/css
sass src/style.scss > web/css/style.css
