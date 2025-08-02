#!/bin/bash

# RSS Feed Update Script
# This script updates the RSS feed using the best available method

echo "🔄 Updating RSS Feed..."

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "📦 Using Node.js RSS generator..."
    node rss-generator.js
else
    echo "❌ Error: Node.js is not available"
    echo "Please install Node.js to generate the RSS feed"
    exit 1
fi

echo "✅ RSS feed updated successfully!"
echo "📄 Feed available at: rss.xml" 