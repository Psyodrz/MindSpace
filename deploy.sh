#!/bin/bash
# MindSpace Auto-Deploy Script
# This script commits changes and pushes to GitHub, triggering Vercel deployment

echo "=========================================="
echo "  MindSpace Auto-Deploy"
echo "=========================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check for changes
git status

# Get commit message from user or use default
read -p "Enter commit message (or press Enter for 'Update MindSpace'): " commit_msg
commit_msg=${commit_msg:-"Update MindSpace"}

echo ""
echo "Adding all changes..."
git add .

echo ""
echo "Committing with message: $commit_msg"
git commit -m "$commit_msg"

echo ""
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "=========================================="
echo "  Deployment triggered!"
echo "  Vercel will automatically deploy your changes."
echo "  Visit your Vercel dashboard to monitor progress."
echo "=========================================="
