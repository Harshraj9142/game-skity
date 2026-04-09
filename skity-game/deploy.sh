#!/bin/bash

# FRAMED Game - Quick Deployment Script
# This script automates the contract deployment process

set -e  # Exit on error

echo "🎮 FRAMED Game - Contract Deployment"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the skity-game root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Build contract
echo "🔨 Step 2: Building contract..."
cd contract
npm run compact
npm run build
cd ..
echo "✅ Contract built"
echo ""

# Step 3: Copy ZK keys
echo "🔑 Step 3: Copying ZK keys to public directory..."
mkdir -p public/zk-keys
cp -r contract/src/managed/game/keys/* public/zk-keys/
echo "✅ ZK keys copied"
echo ""

# Step 4: Deploy
echo "🚀 Step 4: Deploying to preprod..."
echo ""
echo "⚠️  IMPORTANT: Follow the prompts to:"
echo "   1. Connect your Lace wallet"
echo "   2. Enter max players (default: 4)"
echo "   3. Confirm deployment"
echo ""
echo "📝 After deployment, copy the contract address!"
echo ""
read -p "Press Enter to start deployment..."

cd skity-cli
npm run preprod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy the contract address from above"
echo "   2. Update src/components/room-picker.tsx with the new address"
echo "   3. Run 'npm run dev' to start the frontend"
echo ""
