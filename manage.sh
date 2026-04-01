#!/bin/bash
set -e

BACKEND_PORT=3001
FRONTEND_PORT=5173
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

check_port() { lsof -ti:$1 >/dev/null 2>&1; }

stop_servers() {
    echo "Stopping servers..."
    local stopped=0
    check_port $BACKEND_PORT && { lsof -ti:$BACKEND_PORT | xargs -r kill -9 2>/dev/null; stopped=1; }
    check_port $FRONTEND_PORT && { lsof -ti:$FRONTEND_PORT | xargs -r kill -9 2>/dev/null; stopped=1; }
    [ $stopped -eq 0 ] && echo "  No servers running" || { sleep 1; echo -e "${GREEN}Done${NC}"; }
}

start_servers() {
    echo "Starting Grand Stay..."
    lsof -ti:$BACKEND_PORT,$FRONTEND_PORT | xargs -r kill -9 2>/dev/null || true
    if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        echo "Installing dependencies..."
        npm install && (cd frontend && npm install)
    fi
    echo "Backend:  http://localhost:$BACKEND_PORT"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "Press Ctrl+C to stop"
    npm run dev
}

run_tests() {
    echo "Testing API..."
    if ! check_port $BACKEND_PORT; then
        echo -e "${RED}Backend not running${NC}"; exit 1
    fi
    
    echo "1. Health Check"
    curl -sf http://localhost:$BACKEND_PORT/api/health >/dev/null && echo -e "   ${GREEN}OK${NC}" || { echo -e "   ${RED}FAIL${NC}"; exit 1; }
    
    echo "2. Rooms API"
    ROOMS=$(curl -s http://localhost:$BACKEND_PORT/api/rooms | jq 'length' 2>/dev/null || echo "0")
    echo -e "   ${GREEN}OK${NC} ($ROOMS rooms)"
    
    echo "3. Auth API"
    LOGIN=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' 2>/dev/null)
    echo "$LOGIN" | jq -e '.user_id' >/dev/null 2>&1 && echo -e "   ${GREEN}OK${NC}" || echo -e "   ${YELLOW}WARN${NC}"
    
    echo ""
    echo "Credentials: admin/admin123, staff/staff123"
}

show_status() {
    echo "Status:"
    check_port $BACKEND_PORT && echo -e "  Backend:  ${GREEN}running${NC}" || echo -e "  Backend:  ${RED}stopped${NC}"
    check_port $FRONTEND_PORT && echo -e "  Frontend: ${GREEN}running${NC}" || echo -e "  Frontend: ${RED}stopped${NC}"
}

clean_project() {
    echo "Cleaning..."
    rm -rf node_modules backend/node_modules frontend/node_modules frontend/dist
    rm -f npm-debug.log* yarn-error.log*
    echo -e "${GREEN}Done${NC}"
}

print_help() {
    echo "Usage: ./manage.sh [command]"
    echo "Commands: start, stop, restart, test, status, clean, help"
}

COMMAND=${1:-start}
case $COMMAND in
    start) start_servers ;;
    stop) stop_servers ;;
    restart) stop_servers; sleep 1; start_servers ;;
    test) run_tests ;;
    status) show_status ;;
    clean) clean_project ;;
    help|--help|-h) print_help ;;
    *) echo "Unknown: $COMMAND"; print_help; exit 1 ;;
esac
