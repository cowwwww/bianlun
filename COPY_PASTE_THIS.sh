#!/bin/bash

# ═══════════════════════════════════════════════════════════
# 📤 UPLOAD TO GITHUB - JUST RUN THIS SCRIPT!
# ═══════════════════════════════════════════════════════════

echo "🚀 GitHub Upload Helper"
echo ""

# Check if we're in the right directory
if [ ! -d "tournament-frontend" ]; then
    cd /Users/mac/Downloads/bianluns\(9.5:10\)
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Check git status
echo "📊 Checking git status..."
git status --short
echo ""

# Ask for GitHub username
echo "❓ What is your GitHub username?"
read -p "Username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

# Confirm repository name
echo ""
echo "📝 Repository will be created as: https://github.com/$GITHUB_USER/bianluns"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🌐 PLEASE DO THIS FIRST:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Open: https://github.com/new"
echo ""
echo "2. Repository name: bianluns"
echo ""
echo "3. Make it: Private"
echo ""
echo "4. DON'T check any boxes"
echo ""
echo "5. Click: Create repository"
echo ""
read -p "Done? Press ENTER when repository is created..."

echo ""
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/$GITHUB_USER/bianluns.git

echo ""
echo "📤 Pushing to GitHub..."
echo ""
echo "⚠️  When prompted for password, use a Personal Access Token:"
echo "   Get one at: https://github.com/settings/tokens"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              ✅ SUCCESSFULLY UPLOADED TO GITHUB!           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 View at: https://github.com/$GITHUB_USER/bianluns"
    echo ""
    echo "⏭️  NEXT STEP:"
    echo "   Deploy to Cloudflare - Read: CLOUDFLARE_QUICK_START.md"
    echo ""
else
    echo ""
    echo "❌ Upload failed. Check your credentials and try again."
    echo ""
    echo "💡 TIP: Use Personal Access Token as password"
    echo "   Get at: https://github.com/settings/tokens"
    echo ""
fi

