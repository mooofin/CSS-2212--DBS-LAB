#!/bin/bash
# Kill Grand Stay server running on port 3001

echo "Stopping Grand Stay server..."

# Find process on port 3001
PID=$(lsof -ti:3001)

if [ -z "$PID" ]; then
    echo "No process found running on port 3001"
    exit 0
fi

echo "Found process $PID on port 3001"
kill $PID

# Wait a moment and check if it's killed
sleep 1

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Process still running, forcing kill..."
    kill -9 $PID
    sleep 1
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "[ERROR] Failed to kill process"
    exit 1
else
    echo "[OK] Server stopped successfully"
fi
