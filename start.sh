#!/bin/bash
# Grand Stay Hotel Management System - Startup Script

set -e

echo "Grand Stay Hotel Management System"
echo "====================================="
echo ""

# Check if MySQL is running
if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb || pgrep -x mysqld > /dev/null 2>&1; then
    echo "[OK] MySQL is running"
else
    echo "[ERROR] MySQL is not running. Please start MySQL first."
    exit 1
fi

# Check if database exists
if mysql -u hotel -photel123 -e "USE hotel_mgmt;" 2>/dev/null; then
    echo "[OK] Database 'hotel_mgmt' exists"
else
    echo "[ERROR] Database 'hotel_mgmt' not found. Please run the schema.sql first."
    exit 1
fi

# Navigate to backend
cd "$(dirname "$0")/backend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check if frontend is built
if [ ! -d "../frontend-astro/dist" ]; then
    echo "Building frontend..."
    cd ../frontend-astro
    npm install
    npm run build
    cd ../backend
fi

echo ""
echo "Starting Grand Stay server..."
echo "Server will be available at: http://localhost:3001"
echo ""
echo "Default login credentials:"
echo "  Admin: admin / admin123"
echo "  Staff: staff / staff123"
echo ""

# Start the server
node server.js
