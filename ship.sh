#!/bin/bash
# ship: push to GitHub + auto-deploy to Vercel production
# Usage: ./ship.sh "commit message"  OR  ./ship.sh  (uses staged changes with auto-msg)
set -e
cd "$(git rev-parse --show-toplevel)"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "⚠️  Not on main (on $BRANCH). Switching..."
  git checkout main
fi

# Auto-commit if message provided
if [ -n "$1" ]; then
  git add -A
  git commit -m "$1"
fi

# Push
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to Vercel
echo "🚀 Deploying to Vercel production..."
npx vercel --prod --yes 2>&1 | tail -5

echo ""
echo "✅ Shipped. Live at https://vizbiz.ai"
