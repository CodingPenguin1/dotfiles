#!/bin/bash

note_filename="$HOME/notes/note-$(date +%Y-%m-%d).md"

if [ ! -f $note_filename ]; then
    echo "# Notes for $(date +%Y-%m-%d)" > $note_filename
fi

vim -c "norm Go" \
    -c "norm Go## $(date +%H:%M)" \
    -c "norm G2o" \
    -c "norm zz" \
    -c "startinsert" $note_filename

