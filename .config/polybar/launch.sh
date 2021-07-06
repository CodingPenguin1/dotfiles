#!/usr/bin/env bash

# Terminate already running bar instances
killall -q polybar
killall -q weather-bar

# Wait until the processes have been shut down
while pgrep -u $UID -x polybar > /dev/null ; do sleep 1 ; done

# Launch CLIARG bar
for bar in "$@"
do
    echo "$bar"
    polybar "$bar" & 
done

