#!/usr/bin/env python

from __future__ import print_function
import datetime
import pickle
import time
import os
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request


# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


def login():
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('/home/rjslater/.config/polybar/scripts/GCalNotifier/token.pickle'):
        with open('/home/rjslater/.config/polybar/scripts/GCalNotifier/token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('/home/rjslater/.config/polybar/scripts/GCalNotifier/token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds


def getCalendarEvents(creds, calendarID='primary'):
    service = build('calendar', 'v3', credentials=creds)
    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
    events_result = service.events().list(calendarId=calendarID, timeMin=now,
                                          maxResults=10, singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])

    if not events:
        return []
    calEvents = []
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))
        calEvents.append([event['summary'], start[:-6], end[:-6]])
    return calEvents


if __name__ == '__main__':
    try:
        # Login to Google
        creds = login()

        # List of calendarIDs to access
        calendarIDs = ['primary', 'mi940ahaptbd77e4ulqie1j1q0@group.calendar.google.com', 'j1lslgfgvb6hgbn5i2hjom1mg4@group.calendar.google.com', 'v11hnvt2n9e1bl7jjfkuhvetgc@group.calendar.google.com', 'vq43s0f0c6qdm6hp5heh45h7sk@group.calendar.google.com', 'u2k944mlf2l0u3dvcvn15r11p0@group.calendar.google.com']

        # Read next 10 upcoming events from each calendar
        events = []
        for calendar in calendarIDs:
            calEvents = getCalendarEvents(creds, calendar)
            for event in calEvents:
                try:
                    start = event[1]
                    end = event[2]
                    start = time.mktime(datetime.datetime.strptime(event[1], "%Y-%m-%dT%H:%M:%S").timetuple())
                    end = time.mktime(datetime.datetime.strptime(event[2], "%Y-%m-%dT%H:%M:%S").timetuple())
                    events.append((event[0], start, end))
                except:
                    pass

        # Get current time
        now = time.time()

        # Make new list of time until event start and end times
        timeUntil = []
        for event in events:
            timeUntil.append((event[0], event[1]-now, event[2]-now))

        printThis = ''
        for event in timeUntil:
            if event[1] < 900 and event[1] > 0:  # If less than 15 minutes until event, put on polybar
                if int(event[1]/60) == 0:
                    printThis += ' | ' + event[0] + ' starting now'
                elif int(event[1]/60) == 1:
                    printThis += ' | ' + event[0] + ' in {} min'.format(int(event[1]/60))
                elif int(event[1]/60) == 5:
                    printThis += ' | ' + event[0] + ' in {} mins'.format(int(event[1]/60))
                    os.system('notify-send "{} starting in 5 minutes"'.format(event[0]))
                else:
                    printThis += ' | ' + event[0] + ' in {} mins'.format(int(event[1]/60))
            elif event[1] < 0 and event[2] > 0:
                if int(event[2]/60) == 0:
                    printThis += ' | ' + event[0] + ' ending now'
                elif int(event[2]/60) == 1:
                    printThis += ' | ' + event[0] + ' ({} min)'.format(int(event[2]/60))
                else:
                    timeLeft = int(event[2]/60)
                    if timeLeft >= 60:
                        printThis += ' | ' + event[0] + ' (%d:%02d)' % (timeLeft//60, timeLeft%60)
                    else:
                        printThis += ' | ' + event[0] + ' ({} mins)'.format(int(event[2]/60))
        print(printThis[3:])

    except:
        print('')
