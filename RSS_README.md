# RSS Feed for Jack O'Keeffe's Portfolio

This portfolio website now includes an RSS feed that aggregates recent activity from multiple platforms.

## RSS Feed URLs

- **Dynamic Feed**: `https://jackokeeffe.com/rss.php` (requires PHP)
- **Static Feed**: `https://jackokeeffe.com/rss.xml` (fallback option)

## Generation Options

### Option 1: PHP (Recommended)
- **File**: `rss.php` - Dynamic RSS feed generator
- **Generator**: `generate-rss.php` - Static feed generator
- **Requirements**: PHP with `allow_url_fopen` enabled

### Option 2: Node.js (Alternative)
- **File**: `rss-generator.js` - Node.js RSS feed generator
- **Requirements**: Node.js 18+ with fetch support
- **Usage**: `node rss-generator.js`

## What's Included

The RSS feed includes recent activity from:

- **GitHub**: Repository events, commits, stars, forks, pull requests, issues
- **Mastodon**: Recent posts from @jackokeeffe@mastodon.social
- **Letterboxd**: Recent movie watches and ratings
- **Nostr**: Recent notes (when available)

## How to Subscribe

### RSS Readers
1. Copy the RSS feed URL: `https://jackokeeffe.com/rss.php`
2. Add it to your favorite RSS reader (Feedly, Inoreader, etc.)

### Browser Extensions
- **Firefox**: Click the RSS icon in the address bar
- **Chrome**: Use extensions like "RSS Feed Reader"

### Command Line
```bash
# Using curl to check the feed
curl https://jackokeeffe.com/rss.php

# Using wget to download the feed
wget https://jackokeeffe.com/rss.php -O feed.xml
```

## Feed Updates

- **Dynamic Feed**: Updates automatically when accessed
- **Static Feed**: Can be updated manually or via cron job

### Updating the Static Feed

If you want to generate a static RSS feed (useful for static hosting):

#### Using PHP:
```bash
# Run the PHP generator script
php generate-rss.php
```

#### Using Node.js:
```bash
# Run the Node.js generator script
node rss-generator.js
```

### Setting up Automatic Updates

Add this to your crontab to update the static feed every hour:

#### Using PHP:
```bash
0 * * * * cd /path/to/portfolio && php generate-rss.php
```

#### Using Node.js:
```bash
0 * * * * cd /path/to/portfolio && node rss-generator.js
```

## Feed Configuration

The feed includes:
- **Title**: "Jack O'Keeffe - Recent Activity"
- **Description**: Recent activity across all platforms
- **Language**: English (en-US)
- **TTL**: 60 minutes (cache time)
- **Max Items**: 20 most recent activities

## Troubleshooting

### If the dynamic feed doesn't work:
1. Check if PHP is enabled on your server
2. Verify that `allow_url_fopen` is enabled in PHP
3. Use the static feed (`rss.xml`) as a fallback
4. Try the Node.js generator as an alternative

### If you see no content:
1. Check if the external APIs are accessible
2. Verify your GitHub username and Mastodon handle are correct
3. Check server error logs for any issues

## Customization

To modify the feed:
1. Edit `rss.php` to change feed settings
2. Update the feed title, description, and language
3. Modify the activity parsing functions as needed
4. Adjust the number of items per platform

## RSS Feed Discovery

The website includes:
- RSS feed link in the HTML head section
- RSS icon in the social media buttons
- Proper RSS feed headers and metadata 