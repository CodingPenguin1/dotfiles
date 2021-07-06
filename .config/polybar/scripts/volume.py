#!/usr/bin/env python

import re
import subprocess


class Sink:
    def __init__(self, properties):
        self.number = int(re.findall('\d+', properties[0])[0])
        self.state = properties[1].split(' ')[1]
        self.name = properties[2].split(' ')[1]
        self.formattedName = ' '.join(properties[27].split(' ')[2:]).replace('"', '')
        self.volume = properties[9].split(' ')[5]
        self.muted = 'no' not in properties[8]

    def __str__(self):
        return f'{self.formattedName} {self.volume}'


if __name__ == '__main__':
    # Get number of current sink
    with open('/home/rjslater/.config/i3/.currentAudioOutput', 'r') as f:
        currentAudioOutput = int(f.readline())

    # Get sink info from pactl
    p = subprocess.Popen(['pactl', 'list', 'sinks'], stdout=subprocess.PIPE)
    output = p.communicate()[0].decode().split('\n')

    # Parse output from pactl
    sinks = []
    start = 0
    for i in range(len(output)):
        if len(output[i].strip()) == 0:
            sinks.append(Sink([line.strip() for line in output[start:i + 1]]))
            start = i + 1

    # Print currently selected sink
    for sink in sinks:
        if sink.number == currentAudioOutput:
            print(sink)
            quit()

    # Hardcode Nvidia because it's #14 for some god-forsaken reason
    if currentAudioOutput > 3:
        for sink in sinks:
            if sink.formattedName == 'HDA NVidia':
                print(sink)
