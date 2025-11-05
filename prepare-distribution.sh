#!/bin/bash

# FoodTok Distribution Preparation Script
# This script prepares a clean version of the project for sharing

echo "🍔 Preparing FoodTok for distribution..."

# Clean up development artifacts
echo "🧹 Cleaning development artifacts..."
rm -rf .next
rm -rf node_modules
rm -rf .git
rm -f *.log
rm -f .DS_Store
find . -name ".DS_Store" -delete

# Remove backup files
echo "🗑️  Removing backup files..."
rm -f src/components/features/RestaurantCard.tsx.backup

# Clean up temporary files
echo "✨ Final cleanup..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete

echo "✅ Distribution package ready!"
echo "📦 Your friends can now:"
echo "   1. Extract this folder"
echo "   2. Run 'npm install'"
echo "   3. Run 'npm run dev'"
echo "   4. Open http://localhost:3000 on their phone"
echo ""
echo "🎉 Happy coding!"