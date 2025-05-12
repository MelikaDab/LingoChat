#!/bin/bash

echo "======= FIXING API KEY ISSUES ======="

echo "1. Stopping any running Expo processes..."
pkill -f "expo" || true

echo "2. Clearing Expo cache..."
rm -rf node_modules/.cache/expo

echo "3. Verifying .env file..."
if [ -f ".env" ]; then
  echo "   ✅ .env file exists"
  
  # Check if the API key exists and is properly formatted
  if grep -q "^OPENAI_API_KEY=sk-" .env; then
    echo "   ✅ API key format looks good"
  else
    echo "   ⚠️ API key in .env might not be correctly formatted"
    echo "   It should be in the format: OPENAI_API_KEY=sk-yourkeyhere"
    echo "   No quotes, no spaces, just the key directly after ="
  fi
else
  echo "   ❌ .env file not found!"
  echo "   Creating a template .env file..."
  echo "OPENAI_API_KEY=sk-your-key-here" > .env
  echo "   Please edit .env and add your actual API key"
  exit 1
fi

echo "4. Installing dotenv package (if needed)..."
npm install dotenv --save

echo "5. Testing API key loading..."
node scripts/test-env.js

echo "6. Clearing React Native and Metro bundler caches..."
watchman watch-del-all || true
rm -rf $TMPDIR/metro-* || true

echo "7. Restarting Expo with clean cache..."
npx expo start -c

echo "\nIf you're still experiencing issues, try: npm install" 