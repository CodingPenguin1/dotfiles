#!/usr/bin/env python3
import dbus
import time
import pathlib
from os.path import exists


def format_time(seconds):
    return time.strftime("%-M:%S", time.gmtime(seconds))


def us_to_secs(us):
    return us // 1000000


def map(value, leftMin, leftMax, rightMin, rightMax):
    # Figure out how 'wide' each range is
    leftSpan = leftMax - leftMin
    rightSpan = rightMax - rightMin

    # Convert the left range into a 0-1 range (float)
    valueScaled = float(value - leftMin) / float(leftSpan)

    # Convert the 0-1 range into a value in the right range.
    return rightMin + (valueScaled * rightSpan)


def bar(playing_for, duration):
    chars = 10
    chars_ahead = int(map(playing_for, 0, duration, 0, chars))
    return chars_ahead * '-' + '|' + (chars - chars_ahead) * '-'


if __name__ == '__main__':
    try:
        # Get info from dbus
        session_bus = dbus.SessionBus()
        spotify_bus = session_bus.get_object('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2')
        spotify_properties = dbus.Interface(spotify_bus, 'org.freedesktop.DBus.Properties')
        metadata = spotify_properties.Get('org.mpris.MediaPlayer2.Player', 'Metadata')

        previous_song_name = ''
        start_time = -1

        # Get the previous song and start time
        code_directory = str(pathlib.Path(__file__).parent.absolute())
        file = code_directory + '/.previous_spotify_track'
        if exists(file):
            with open(code_directory + '/.previous_spotify_track', 'r') as f:
                lines = f.readlines()
                previous_song_name = lines[0].strip()
                start_time = int(float(lines[1]))

        # If current song is different than previous song, write file
        if metadata['xesam:title'] != previous_song_name:
            with open(file, 'w') as f:
                f.write(metadata['xesam:title'] + '\n')
                f.write(str(int(time.time())))

        playing_for = int(time.time()) - start_time
        duration = int(us_to_secs(metadata['mpris:length']))

        if playing_for <= duration:
            print(f'{metadata["xesam:artist"][0]} - {metadata["xesam:title"]} [{format_time(playing_for)} {bar(playing_for, duration)} {format_time(duration)}]')
        else:
            print(f'{metadata["xesam:artist"][0]} - {metadata["xesam:title"]}')
    except dbus.exceptions.DBusException:
        print('')

