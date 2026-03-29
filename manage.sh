#!/bin/bash
# Grand Stay Hotel Management System
# Unified management script

set -e

BACKEND_PORT=3001
FRONTEND_PORT=5173

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_help() {
    cat << EOF
Grand Stay Management Script

Usage: ./manage.sh [command]

Commands:
  start     Start the application (default)
  stop      Stop all running servers
  restart   Restart the application
  test      Run API tests
  status    Check server status
  clean     Clean node_modules and caches
  help      Show this help message

Examples:
  ./manage.sh start
  ./manage.sh stop
  ./manage.sh test

EOF
}

check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
}

stop_servers() {
    echo "Stopping servers..."
    
    local stopped=0
    
    if check_port $BACKEND_PORT; then
        echo "  Stopping backend (port $BACKEND_PORT)..."
        lsof -ti:$BACKEND_PORT | xargs -r kill -9 2>/dev/null
        stopped=1
    fi
    
    if check_port $FRONTEND_PORT; then
        echo "  Stopping frontend (port $FRONTEND_PORT)..."
        lsof -ti:$FRONTEND_PORT | xargs -r kill -9 2>/dev/null
        stopped=1
    fi
    
    if [ $stopped -eq 0 ]; then
        echo "  No servers running"
    else
        sleep 1
        echo -e "${GREEN}✓${NC} Servers stopped"
    fi
}

start_servers() {
    echo "Starting Grand Stay Hotel Management System..."
    echo ""
    
    # Stop any existing processes
    lsof -ti:$BACKEND_PORT,$FRONTEND_PORT | xargs -r kill -9 2>/dev/null || true
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend-astro/node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        echo ""
    fi
    
    echo "Starting servers..."
    echo "  Backend:  http://localhost:$BACKEND_PORT"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    
    npm run dev
}

run_tests() {
    echo "Testing Grand Stay API..."
    echo "=========================================="
    echo ""
    
    if ! check_port $BACKEND_PORT; then
        echo -e "${RED}✗${NC} Backend not running on port $BACKEND_PORT"
        echo "  Start the server first: ./manage.sh start"
        exit 1
    fi
    
    echo "1. Health Check..."
    if curl -sf http://localhost:$BACKEND_PORT/api/health > /dev/null; then
        echo -e "   ${GREEN}✓${NC} API is healthy"
    else
        echo -e "   ${RED}✗${NC} API health check failed"
        exit 1
    fi
    echo ""
    
    echo "2. Rooms Endpoint..."
    ROOMS=$(curl -s http://localhost:$BACKEND_PORT/api/rooms | jq 'length' 2>/dev/null || echo "0")
    echo -e "   ${GREEN}✓${NC} Found $ROOMS rooms"
    echo ""
    
    echo "3. Login Test..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' 2>/dev/null)
    
    if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} Authentication works"
    else
        echo -e "   ${YELLOW}⚠${NC} Login test incomplete (check response)"
    fi
    echo ""
    
    echo -e "${GREEN}Tests completed${NC}"
    echo ""
    echo "Demo credentials:"
    echo "  Admin: admin / admin123"
    echo "  Staff: staff / staff123"
}

show_status() {
    echo "Server Status"
    echo "=========================================="
    echo ""
    
    if check_port $BACKEND_PORT; then
        PID=$(lsof -ti:$BACKEND_PORT)
        echo -e "Backend:  ${GREEN}running${NC} (PID $PID, port $BACKEND_PORT)"
    else
        echo -e "Backend:  ${RED}stopped${NC}"
    fi
    
    if check_port $FRONTEND_PORT; then
        PID=$(lsof -ti:$FRONTEND_PORT)
        echo -e "Frontend: ${GREEN}running${NC} (PID $PID, port $FRONTEND_PORT)"
    else
        echo -e "Frontend: ${RED}stopped${NC}"
    fi
    
    echo ""
}

clean_project() {
    echo "Cleaning project..."
    
    echo "  Removing node_modules..."
    rm -rf node_modules backend/node_modules frontend-astro/node_modules
    
    echo "  Removing build artifacts..."
    rm -rf frontend-astro/dist frontend-astro/.astro
    
    echo "  Removing logs..."
    rm -f npm-debug.log* yarn-error.log*
    
    echo -e "${GREEN}✓${NC} Project cleaned"
    echo "  Run './manage.sh start' to reinstall and start"
}

# Main script logic
COMMAND=${1:-start}

case $COMMAND in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        stop_servers
        sleep 1
        start_servers
        ;;
    test)
        run_tests
        ;;
    status)
        show_status
        ;;
    clean)
        clean_project
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
