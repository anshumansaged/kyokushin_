#!/bin/bash

echo "🧪 Testing Kyokushin Backend API..."

# Test 1: Server health check
echo "1. Testing server health..."
curl -s http://localhost:5001/ | jq '.' || echo "Failed to connect to server"

echo -e "\n2. Testing registration API..."
# Test 2: Registration
curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser' $(date +%s) '@example.com",
    "password": "password123",
    "role": "student",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "phoneNumber": "1234567890",
      "assignedInstructor": "admin-approval"
    }
  }' | jq '.' || echo "Registration API failed"

echo -e "\n3. Testing login API with non-existent user..."
# Test 3: Login
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
  }' | jq '.' || echo "Login API failed"

echo -e "\n✅ API tests complete!"
