#!/bin/bash

echo "Stopping any running Expo processes..."
pkill -f "expo"

echo "Clearing Expo cache..."
rm -rf node_modules/.cache/expo

echo "Clearing React Native cache..."
watchman watch-del-all

echo "Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-*

echo "Starting Expo with clean cache..."
npx expo start -c

echo "If you're still experiencing issues, try: rm -rf node_modules && npm install" 