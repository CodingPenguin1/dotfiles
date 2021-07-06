#!/usr/bin/env python3

import multiprocessing
import subprocess


CPU_COUNT = int(multiprocessing.cpu_count())


if __name__ == '__main__':
    # Get CPU core usages
    result = subprocess.run('mpstat -P ALL 1 1'.split(' '), capture_output=True, text=True).stdout
    result = result.split('\n')

    cpu_usage = [
        float([i for i in result[i].split(' ') if i][2])
        for i in range(len(result) - CPU_COUNT - 1, len(result) - 1)
    ]

    # Print usages
    printout = ''
    for core in cpu_usage:
        if core < 100 / 7:
            printout += '▁'
        elif core < 200 / 7:
            printout += '▃'
        elif core < 300 / 7:
            printout += '▄'
        elif core < 400 / 7:
            printout += '▅'
        elif core < 500 / 7:
            printout += '▆'
        elif core < 600 / 7:
            printout += '▇'
        else:
            printout += '█'
    print(printout)
