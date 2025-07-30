#!/bin/bash

echo "🧪 Testing Admin Login..."

# Test admin login
echo "Testing Sihan admin login..."
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sihan@kyokushin.com",
    "password": "admin123"
  }' | jq '.'

echo -e "\n---"

# Test regular user login (should show different message)
echo "Testing regular user login..."
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regular@example.com",
    "password": "wrongpassword"
  }' | jq '.'

echo -e "\n✅ Admin login tests complete!"
