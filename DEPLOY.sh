#!/bin/bash

# Central Bank Game - Deployment Script
# This script helps you deploy the game to GitHub Pages

echo "🏦 Central Bank Game - Deployment Setup"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Git and npm are installed"
echo ""

# Ask for GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo-name): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No repository URL provided. Exiting."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building the project..."
npm run build

echo ""
echo "📝 Initializing git repository..."
git init
git add .
git commit -m "Central Bank Game - React version"

echo ""
echo "🔗 Adding remote repository..."
git remote add origin $REPO_URL

echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Go to Settings → Pages"
echo "3. Under 'Source', select 'GitHub Actions'"
echo "4. The workflow will automatically deploy your site"
echo ""
echo "🌐 Your game will be available at:"
echo "   https://$(echo $REPO_URL | sed 's/https:\/\/github.com\///' | sed 's/.git//').github.io/$(echo $REPO_URL | sed 's/.*\///' | sed 's/.git//')/"
echo ""
echo "🎉 Done!"
