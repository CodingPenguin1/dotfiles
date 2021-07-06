#!/usr/bin/env python3
import subprocess
from sys import argv


def get_ip():
    ps = subprocess.Popen('ip a show wlp4s0', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = ps.communicate()[0].decode('utf-8').strip().split('\n')
    ip = output[2][output[2].find('inet') + 4:output[2].find('/')].strip()
    return ip


if __name__ == '__main__':
    if len(argv) > 1:
        host = argv[1]
    else:
        ip = get_ip()
        host = ip[:ip.rfind('.')]
    print(f'Scanning {host}')

    ps = subprocess.Popen(f'sudo nmap -sn {host}.0/24', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = ps.communicate()[0].decode('utf-8').strip().split('\n')

    for line in output:
        if host in line:
            print('\n')
        print(line)
