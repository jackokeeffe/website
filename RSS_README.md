# RSS Feed for Jack O'Keeffe's Portfolio

This portfolio website includes an RSS feed that aggregates recent activity from multiple platforms.

## RSS Feed URL

- **Static Feed**: `https://jackokeeffe.com/rss.xml`

## Generation Method

### Node.js RSS Generator
- **File**: `rss-generator.js` - Node.js RSS feed generator
- **Requirements**: Node.js 18+ with fetch support
- **Usage**: `node rss-generator.js` or `npm run generate-rss`

## What's Included

The RSS feed includes recent activity from:

- **GitHub**: Repository events, commits, stars, forks, pull requests, issues
- **Mastodon**: Recent posts from @jackokeeffe@mastodon.social
- **Letterboxd**: Recent movie watches and ratings
- **Nostr**: Recent notes (when available)

## How to Subscribe

### RSS Readers
1. Copy the RSS feed URL: `https://jackokeeffe.com/rss.xml`
2. Add it to your favorite RSS reader (Feedly, Inoreader, etc.)

### Browser Extensions
- **Firefox**: Click the RSS icon in the address bar
- **Chrome**: Use extensions like "RSS Feed Reader"

### Command Line
```bash
# Using curl to check the feed
curl https://jackokeeffe.com/rss.xml

# Using wget to download the feed
wget https://jackokeeffe.com/rss.xml -O feed.xml
```

## Feed Updates

The static RSS feed can be updated manually or via cron job.

### Updating the Feed

```bash
# Run the Node.js generator script
node rss-generator.js

# Or use npm script
npm run generate-rss

# Or use the update script
./update-rss.sh
```

### Setting up Automatic Updates

Add this to your crontab to update the feed every hour:

```bash
0 * * * * cd /path/to/portfolio && node rss-generator.js
```

## Feed Configuration

The feed includes:
- **Title**: "Jack O'Keeffe - Recent Activity"
- **Description**: Recent activity across all platforms
- **Language**: English (en-US)
- **TTL**: 60 minutes (cache time)
- **Max Items**: 8 most recent activities (matching the recent activity section)

## Troubleshooting

### If you see no content:
1. Check if the external APIs are accessible
2. Verify your GitHub username and Mastodon handle are correct
3. Check server error logs for any issues
4. Ensure Node.js 18+ is installed

### If the generator fails:
1. Check if all dependencies are installed: `npm install`
2. Verify network connectivity to external APIs
3. Check the console output for specific error messages

## Customization

To modify the feed:
1. Edit `rss-generator.js` to change feed settings
2. Update the feed title, description, and language
3. Modify the activity parsing functions as needed
4. Adjust the number of items per platform

## RSS Feed Discovery

The website includes:
- RSS feed link in the HTML head section
- RSS icon in the social media buttons
- Proper RSS feed headers and metadata 