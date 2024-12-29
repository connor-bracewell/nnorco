#/bin/bash
while inotifywait -q -e close_write --exclude='/\.' src; do sleep 1; npm run build >/dev/null 2>&1; echo 'rebuilt'; done
