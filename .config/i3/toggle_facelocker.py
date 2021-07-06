#!/usr/bin/env python3
import os

if not os.path.exists('/tmp/disable_facelocker'):
    f = open('/tmp/disable_facelocker', 'w')
    f.close()
else:
    os.remove('/tmp/disable_facelocker')
