#!/bin/bash

echo "🧪 Testing Signup & Login Fixes"
echo "================================"
echo ""

# Test 1: Create a new user
echo "📝 Test 1: Creating new user with WeChat ID 'testuser123'..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@tournament.app",
    "password": "password123",
    "passwordConfirm": "password123",
    "name": "Test User"
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ User created successfully!"
  USER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
  echo "   User ID: $USER_ID"
else
  echo "❌ Failed to create user"
  echo "   Response: $RESPONSE"
fi

echo ""

# Test 2: Try to create duplicate user (should fail)
echo "📝 Test 2: Trying to create duplicate user (should fail)..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@tournament.app",
    "password": "password123",
    "passwordConfirm": "password123",
    "name": "Test User"
  }')

if echo "$RESPONSE" | grep -q 'validation_invalid_email'; then
  echo "✅ Correctly rejected duplicate email!"
else
  echo "❌ Should have rejected duplicate email"
  echo "   Response: $RESPONSE"
fi

echo ""

# Test 3: Login with correct credentials
echo "📝 Test 3: Logging in with correct credentials..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "testuser123@tournament.app",
    "password": "password123"
  }')

if echo "$RESPONSE" | grep -q '"token"'; then
  echo "✅ Login successful!"
  TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ Login failed"
  echo "   Response: $RESPONSE"
fi

echo ""

# Test 4: Login with wrong password (should fail)
echo "📝 Test 4: Trying to login with wrong password (should fail)..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "testuser123@tournament.app",
    "password": "wrongpassword"
  }')

if echo "$RESPONSE" | grep -q '"code":400'; then
  echo "✅ Correctly rejected wrong password!"
else
  echo "❌ Should have rejected wrong password"
  echo "   Response: $RESPONSE"
fi

echo ""
echo "================================"
echo "🎉 All tests completed!"
echo ""
echo "To test the frontend:"
echo "1. cd tournament-frontend"
echo "2. npm run dev"
echo "3. Open http://localhost:5173/signup"
echo "4. Try signing up with WeChat ID: testuser456"
