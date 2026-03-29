#!/bin/bash
# Hotel Management System - Quick Start

echo "🏨 Starting Hotel Management System..."
echo ""

# Kill any processes on required ports
lsof -ti:3001,5174 | xargs -r kill -9 2>/dev/null

# Start dev servers
npm run dev
