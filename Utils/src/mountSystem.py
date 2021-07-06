#!/usr/bin/env python
import sys
from os import system, listdir
from os.path import exists, join
from pathlib import Path

import pandas as pd


if __name__ == '__main__':
    system_name = sys.argv[1]
    #home_directory = str(Path.home())
    home_directory = '/home/rjslater'
    filepath = join(home_directory, '.systems.csv')

    # Read csv
    if exists(filepath):
        systems = pd.read_csv(filepath, header=None).values.tolist()
    else:
        exit(-1)

    # Find system info
    for row in systems:
        if row[0].lower() == system_name.lower():
            user = row[1]
            ip = row[2]
            port = row[3]

            # Check if ssh key exists
            ssh_key = None
            for file in listdir(join(home_directory, '.ssh')):
                if not file.endswith('.pub'):
                    if system_name.lower() in file.lower():
                        ssh_key = join(home_directory, '.ssh', file)
                        break

            # SSH the system
            if ssh_key is not None:
                system(f'sshfs -o IdentityFile={ssh_key} -p {port} {user}@{ip}:/home/{user} {home_directory}/{system_name.lower().capitalize()}')
            else:
                system(f'sshfs -p {port} {user}@{ip}:/home/{user} {home_directory}/{system_name.lower().capitalize()}')

            break
