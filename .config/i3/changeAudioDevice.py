#!/home/rjslater/anaconda3/bin/python
import subprocess
from os import system, chdir

# Move to ~/.config/i3
chdir('/home/rjslater/.config/i3')

# Get device list
listCommand = "pactl list short sinks"
ps = subprocess.Popen(listCommand, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
output = ps.communicate()[0].decode('utf-8').strip().split('\n')
devices = []
for line in output:
    line = [i.strip() for i in line.split('\t') if len(i.strip()) > 0]
    print(line)
    _id = line[0]
    name = line[1]
    # Remove hdmi stereo
    if name != 'alsa_output.pci-0000_0a_00.1.hdmi-stereo':
        devices.append((_id, name))

for device in devices:
    print(device)

# Get current device
try:
    with open('.currentAudioOutput', 'r') as f:
        current_device_id = int(f.read())
except Exception:
    current_device_id = 0

# Increment current device index
current_device_index = 0
for i, device in enumerate(devices):
    if int(device[0]) == int(current_device_id):
        current_device_index = i
current_device_index += 1

if current_device_index >= len(devices):
    current_device_index = 0

# Update current device id
current_device_id = devices[current_device_index][0]

# Set new current device
set_command = 'pacmd set-default-sink "{}"'.format(current_device_id)
system(set_command)

# Notification for new device
if devices[current_device_index][1] == 'alsa_output.pci-0000_0c_00.4.iec958-stereo':
    system('notify-send -t 2000 "Speakers"')
elif devices[current_device_index][1] == 'alsa_output.usb-Cooler_Master_Technology_Inc._MH752_00000000-00.analog-stereo':
    system('notify-send -t 2000 "CM MH752 Headset"')


# Write current device file
with open('.currentAudioOutput', 'w') as f:
    f.write(str(current_device_id))
