#!/usr/bin/env python3
import subprocess


if __name__ == '__main__':
    p = subprocess.Popen('sudo pwrstat -status'.split(' '), stdout=subprocess.PIPE)
    output = p.communicate()[0].decode().split('\n')

    # Strip for easier parsing
    for i in range(len(output)):
        output[i] = output[i].strip()

    # UPS status vars
    state = ''
    source = ''
    battery_capacity = ''
    battery_runtime = ''
    load = ''

    # Get values for vars
    for line in output:
        if line.startswith('State'):
            state = line[line.find('. ') + 1:].strip()
        elif line.startswith('Power Supply by'):
            source = line[line.find('. ') + 1:].strip()
        elif line.startswith('Battery Capacity'):
            battery_capacity = line[line.find('. ') + 1:].strip().replace(' ', '')
        elif line.startswith('Remaining Runtime'):
            battery_runtime = line[line.find('. ') + 1:-1].strip()
        elif line.startswith('Load'):
            load = line[line.find('. ') + 1:line.rfind('(')].strip() + 's'

    if state == 'Normal':
        print(f'{state} ({load})')
    else:
        print(f'{state} {battery_runtime}')
