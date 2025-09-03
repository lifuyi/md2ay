#!/bin/bash

echo "🔍 Checking git status..."
git status

echo ""
echo "📝 Adding changes to git..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Fix preview panel HTML structure bug

- Fixed invalid HTML structure in iframe preview
- Changed document root from <section> to proper <html> element
- Ensures proper rendering of markdown content in preview panel
- Updated both local and Docker versions"

echo ""
echo "🚀 Pushing to GitHub..."
git push

echo ""
echo "✅ Successfully pushed changes to GitHub!"
echo ""
echo "📋 Recent commits:"
git log --oneline -3