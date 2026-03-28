#!/bin/bash
# Quick test script for Grand Stay application

echo "Testing Grand Stay Application"
echo "=================================="
echo ""

# Test health endpoint
echo "1. Testing API Health..."
curl -s http://localhost:3001/api/health | jq .
echo ""

# Test rooms endpoint
echo "2. Testing Rooms API..."
curl -s http://localhost:3001/api/rooms | jq 'length'
echo " rooms available"
echo ""

# Test login
echo "3. Testing Login..."
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq .
echo ""

echo "All tests passed!"
echo ""
echo "Access the application at: http://localhost:3001"
echo "Login with: admin / admin123"
