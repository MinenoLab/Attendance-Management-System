#!/bin/bash
cd /home/pi/attendance_system
/home/pi/.local/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
