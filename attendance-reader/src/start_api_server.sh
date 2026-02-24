#!/bin/bash
cd /home/pi/Attendance-Management-System/attendance-reader/src
/home/pi/py/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
