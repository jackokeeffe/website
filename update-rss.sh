#!/bin/bash

# RSS Feed Update Script
# This script updates the RSS feed using the best available method

echo "🔄 Updating RSS Feed..."

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "📦 Using Node.js RSS generator..."
    node rss-generator.js
elif command -v php &> /dev/null; then
    echo "🐘 Using PHP RSS generator..."
    php generate-rss.php
else
    echo "❌ Error: Neither Node.js nor PHP is available"
    echo "Please install Node.js or PHP to generate the RSS feed"
    exit 1
fi

echo "✅ RSS feed updated successfully!"
echo "📄 Feed available at: rss.xml"
echo "🌐 Web page available at: rss.html" 