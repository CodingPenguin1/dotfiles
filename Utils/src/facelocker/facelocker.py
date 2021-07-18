#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import cpu_count
from os import system
from os.path import *
from time import perf_counter, sleep, time

import cv2
import face_recognition
import numpy as np
import psutil

CONFIG_PATH = 'config.json'
FACES_PATH = ''
LOCK_COMMAND = ''
PRIMARY_USER = ''
LOCK_DELAY = 60
OUTPUT_FILE = ''
DISABLE_FILE = ''


def load_known_face_image(filepath):
    name, encoding = None, None
    try:
        image = face_recognition.load_image_file(filepath)
        encoding = face_recognition.face_encodings(image)[0]
        name = filepath.split('/')[-2:-1]
    except IndexError as e:
        print(f'Face not found: {filepath}')
    return name, encoding


def load_known_faces():
    # Time startup sequence
    start = perf_counter()

    # Determine number of CPU cores to use
    core_count = cpu_count()
    cores_to_use = 1
    if core_count > 4:
        cores_to_use = core_count - 4
    print(f'Found {core_count} CPU cores')
    print(f'Using {cores_to_use} cores to start up')

    # Get list of known face images to process
    face_files = []
    for name in os.listdir(FACES_PATH):
        if isdir(join(FACES_PATH, name)):
            for file in os.listdir(join(FACES_PATH, name)):
                face_files.append(join(FACES_PATH, name, file))

    # Process all known face images
    known_face_names, known_face_encodings = [], []
    with ProcessPoolExecutor(cores_to_use) as executor:
        results = executor.map(load_known_face_image, face_files)
        results = [result for result in results]
        known_face_names = [element[0][0] for element in results if element[0] is not None]
        known_face_encodings = [element[1] for element in results if element[1] is not None]
        print(f'Loaded {len(known_face_names)} images in {round(perf_counter() - start, 2)} seconds\n')
        return known_face_names, known_face_encodings


def load_config():
    global FACES_PATH
    global LOCK_COMMAND
    global LOCK_DELAY
    global PRIMARY_USER
    global OUTPUT_FILE
    global DISABLE_FILE

    config = json.load(open(CONFIG_PATH))
    FACES_PATH = config['faces_path']
    LOCK_COMMAND = config['lock_command']
    LOCK_DELAY = config['lock_delay']
    PRIMARY_USER = config['primary_user']
    OUTPUT_FILE = config['output_file']
    DISABLE_FILE = config['disable_file']

    print(f'Loaded config ({CONFIG_PATH}):')
    for key in config.keys():
        print(f'{key}: {config[key]}')
    print()


if __name__ == '__main__':
    # Read in the configuration filepath from CLI args
    parser = argparse.ArgumentParser()
    parser.add_argument('-c', '--config', type=str, required=False, help='Path to the configuration file')
    args = parser.parse_args()
    if args.config is not None and exists(args.config):
        CONFIG_PATH = args.config
        print(f'Using custom configuration file: {CONFIG_PATH}')
    else:
        print(f'Failed to find configuration file: {args.config}')
        print(f'Using default configuration file: {CONFIG_PATH}')

    # Load the configuration file
    load_config()

    # Load in the known faces images
    known_face_names, known_face_encodings = load_known_faces()

    # Initialize some variables
    face_locations = []
    face_encodings = []
    face_names = []

    # Counter for how many sequential frames to not see user before locking
    lock_counter = LOCK_DELAY

    video_capture = None

    while True:
        time_start = time()
        if not exists(DISABLE_FILE):

            # Get a reference to webcam #0 (the default one)
            if video_capture is None:
                video_capture = cv2.VideoCapture(0)

            # Grab a single frame of video
            ret, frame = video_capture.read()

            # Resize frame of video to 1/4 size for faster face recognition processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

            # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_small_frame = small_frame[:, :, ::-1]

            # Find all the faces and face encodings in the current frame of video
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            face_names = []
            for face_encoding in face_encodings:
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = 'Unknown'

                # Or instead, use the known face with the smallest distance to the new face
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

                face_names.append(name)

            # If user not in frame, decrement lock counter and potentially lock system
            if PRIMARY_USER not in face_names:
                lock_counter -= 1
                if lock_counter <= 0:
                    lock_process = subprocess.run(LOCK_COMMAND)  # This is blocking if LOCK_COMMAND doesn't fork
                    lock_counter = LOCK_DELAY
            else:
                lock_counter = LOCK_DELAY

            print(face_names, lock_counter)
            with open(OUTPUT_FILE, 'w') as f:
                f.write(str(lock_counter))

        else:
            print(f'Facelocker disabled by {DISABLE_FILE}')
            if video_capture is not None:
                video_capture.release()
            video_capture = None
            with open(OUTPUT_FILE, 'w') as f:
                f.write('disabled')

        # Wait for the loop to take 1 second (reduces CPU time)
        sleep_time = time_start + 1 - time()
        if sleep_time > 0:
            sleep(sleep_time)

    # Release handle to the webcam
    video_capture.release()
