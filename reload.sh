#/bin/bash
while inotifywait -q -e close_write --exclude='/\.' src; do sleep 1; npm run build; echo 'rebuilt'; done
