# facelocker

Automatically locks your system after you walk away

## About

This program is designed to lock your computer if you walk away. It is NOT coded to support unlocking because simple webcams can be spoofed by various methods. It could be easily modified to do so, but I highly advise against it, unless you want your roommates getting easy access to your computer.

The program takes a picture every second and performs facial detection and recognition. If a specified person is not visible for the configured amount of time, the program will call a command to lock the system.

On startup, the program will open every image in `faces_path/` and perform facial recognition to "learn" the faces it should be looking for. There's not much reason to have it learn more than one person, but if you want to automatically tell your roommate to go away, you can easily add that functionality. If you have more than 4 CPU threads available, the known faces images will be processed on n-4 threads (where n is the total number of threads available on your system). This significantly reduces startup time.

The rest of the program will execute on a single thread. There is a potential to add multithreaded realtime facial recognition, but I found it wasn't worth spawning more threads, unless a *lot* of people are in an image. The program takes a minimal amount of CPU time (about 14% of a single thread's time over the course of 1 hour on a Ryzen 9 3950X).

If [dlib](https://pypi.org/project/dlib/) is installed and configured correctly, the program can be GPU-accelerated, though it will run perfectly fine on purely CPU as well.

When the user has been gone for the set amount of time, the lock command will be called. The program will pause until the lock command has terminated. Lockscreens that run as a daemon may have issues and require modification. This program was tested on [i3lock](https://github.com/i3/i3lock).

Around 10 images of yourself at various angles and in various different lighting scenarios are recommended for best results. The more images you add, the longer the program will take to startup (which may or may not be a big deal, depending on your situation), but the more accurate the facial recognition algorithm will be.

## Installation

Required Python packages:

- [opencv](https://pypi.org/project/opencv-python/)
- [face_recognition](https://pypi.org/project/face-recognition/)
- [numpy](https://pypi.org/project/numpy/)
- [psutil](https://pypi.org/project/psutil/)

## Usage

`./facelocker.py -c PATH/TO/CONFIG/FILE`

## Configuration

### faces_path

Path to directory holding images of faces to recognize. Directory structure should be:

```
- faces_path
    - Person_A_Name
        - Person_A_Image
        - Person_A_Image
    - Person_B_Name
        - Person_B_Image
        - Person_B_Image
```
etc

### lock_command

Command to run when the target person hasn't been seen in a set amount of time

### primary_user

The name of the user to watch for (ex. Person_A_Image)

### lock_delay

How many consecutive seconds the target user has to be out of sight before locking (recommend 10 minimum. I have mine on 300)

### output_file

What file to the current remaining counter for locking to. Useful if you want to put the time to lock on a status bar.

### disable_file

If this file exists, the program will pause. When removed, the program will resume. Nice for if you want to turn away from your camera for a while but don't want your computer to lock.
