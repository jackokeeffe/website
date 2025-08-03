# RSS Feed Update System

This system automatically updates the RSS feed when new activity is detected on your recent activity feed.

## How It Works

1. **Automatic Detection**: When the recent activity section loads new activity, it checks if the activity is recent (within the last hour)
2. **RSS Update Trigger**: If recent activity is detected, it automatically triggers an RSS feed update
3. **Smart Caching**: The RSS generator uses a cache system to only regenerate the feed when new activities are detected
4. **Real-time Updates**: The RSS XML file is updated immediately when new activity is found

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

This will start the server on `http://localhost:3000` and serve your portfolio website.

### 3. Test the RSS Update
```bash
node test-rss-update.js
```

## How to Use

### Development Mode
1. Start the server: `npm start`
2. Open your browser to `http://localhost:3000`
3. The recent activity section will automatically trigger RSS updates when new activity is detected

### Production Deployment
1. Deploy the server to your hosting provider
2. Update the RSS update endpoint URL in `index.html` if needed
3. The system will automatically update the RSS feed when new activity is detected

## Files

- `server.js` - HTTP server that handles RSS update requests
- `rss-generator.js` - Generates the RSS XML file with smart caching
- `index.html` - Contains the JavaScript that triggers RSS updates
- `test-rss-update.js` - Test script for the RSS update functionality

## RSS Feed

The RSS feed is available at:
- Local: `http://localhost:3000/rss.xml`
- Production: `https://yourdomain.com/rss.xml`

## Manual RSS Generation

You can still manually generate the RSS feed:

```bash
npm run generate-rss
```

## Troubleshooting

### RSS Feed Not Updating
1. Check that the server is running: `npm start`
2. Verify the RSS update endpoint is accessible
3. Check browser console for any errors
4. Ensure new activity is within the last hour

### Server Not Starting
1. Make sure Node.js 18+ is installed
2. Check that all dependencies are installed: `npm install`
3. Verify port 3000 is available

### Cache Issues
If the RSS feed seems stale, you can clear the cache:
```bash
rm .rss-cache.json
npm run generate-rss
```

## Configuration

### RSS Update Timing
The system triggers RSS updates for activities within the last hour. You can modify this in `index.html`:

```javascript
// Change from 1 hour to 30 minutes
if (hoursDiff < 0.5) {
    triggerRSSUpdate();
}
```

### Cache Settings
The RSS generator caches activities to avoid unnecessary updates. You can modify the cache behavior in `rss-generator.js`.

## API Endpoints

- `POST /update-rss` - Triggers RSS feed regeneration
- `GET /rss.xml` - Serves the RSS feed
- `GET /` - Serves the main portfolio page

## Monitoring

The server logs all requests and RSS update activities. Check the console output for:
- RSS update requests
- New activity detection
- Cache updates
- Error messages 