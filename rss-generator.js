#!/usr/bin/env node

/**
 * Node.js RSS Feed Generator
 * 
 * Alternative to the PHP RSS generator for environments where PHP isn't available.
 * 
 * Usage: node rss-generator.js
 * 
 * Requirements: Node.js with fetch support (Node 18+)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DOMParser } from '@xmldom/xmldom';

// RSS Feed Configuration
const feedConfig = {
  title: "Jack O'Keeffe - Recent Activity",
  description: "Recent activity from Jack O'Keeffe across GitHub, Mastodon, Nostr, and Letterboxd",
  link: "https://jackokeeffe.com",
  language: "en-US",
  author: "Jack O'Keeffe",
  email: "jokeeffe@protonmail.ch"
};

// Function to fetch GitHub activity (matching the recent activity section)
async function fetchGitHubActivity() {
  try {
    const response = await fetch('https://api.github.com/users/jackokeeffe/events?per_page=8', {
      headers: {
        'User-Agent': 'JackOKeeffe-RSS/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      console.log('GitHub API error:', response.status);
      return [];
    }
    
    const events = await response.json();
    const activities = [];
    
    for (const event of events) {
      // Only include displayable events (matching the recent activity section)
      const displayableTypes = [
        'PushEvent',
        'CreateEvent',
        'WatchEvent',
        'ForkEvent',
        'PullRequestEvent',
        'IssuesEvent',
        'CommitCommentEvent'
      ];
      
      if (!displayableTypes.includes(event.type)) {
        continue;
      }
      
      let description = '';
      let link = '';
      
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload.commits?.length || 0;
          description = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'CreateEvent':
          const createType = event.payload.ref_type === 'repository' ? 'repository' : 
                           (event.payload.ref_type === 'branch' ? 'branch' : 'resource');
          description = `Created ${createType} ${event.payload.ref || event.repo.name}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'WatchEvent':
          description = `Starred ${event.repo.name}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'ForkEvent':
          description = `Forked ${event.repo.name}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'PullRequestEvent':
          const action = event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1);
          const prTitle = event.payload.pull_request?.title || 'pull request';
          description = `${action} pull request: ${prTitle}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'IssuesEvent':
          const issueAction = event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1);
          const issueTitle = event.payload.issue?.title || 'issue';
          description = `${issueAction} issue: ${issueTitle}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        case 'CommitCommentEvent':
          description = `Commented on commit in ${event.repo.name}`;
          link = `https://github.com/${event.repo.name}`;
          break;
        default:
          continue;
      }
      
      activities.push({
        title: description,
        description: description,
        link: link,
        pubDate: new Date(event.created_at).toUTCString(),
        guid: event.id.toString(),
        platform: 'GitHub'
      });
    }
    
    return activities;
  } catch (error) {
    console.log('Error fetching GitHub activity:', error.message);
    return [];
  }
}

// Function to fetch Mastodon activity (matching the recent activity section)
async function fetchMastodonActivity() {
  try {
    // Try multiple CORS proxies like the recent activity section
    const rssUrl = 'https://mastodon.social/@jackokeeffe.rss';
    const proxies = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`,
      `https://thingproxy.freeboard.io/fetch/${rssUrl}`
    ];
    
    let data = null;
    let lastError = null;
    
    // Try each proxy until one works
    for (const proxyUrl of proxies) {
      try {
        console.log('Trying Mastodon proxy:', proxyUrl);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Handle different proxy response formats
        if (responseData.contents) {
          // AllOrigins format
          const base64Content = responseData.contents.split(',')[1];
          const xmlContent = Buffer.from(base64Content, 'base64').toString();
          
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          data = {
            items: Array.from(items).slice(0, 5).map(item => ({
              title: item.querySelector('title')?.textContent || '',
              link: item.querySelector('link')?.textContent || '',
              pubDate: item.querySelector('pubDate')?.textContent || '',
              description: item.querySelector('description')?.textContent || ''
            }))
          };
        } else if (responseData.items && responseData.items.length > 0) {
          // RSS2JSON format
          data = responseData;
        } else {
          continue;
        }
        
        console.log('Successfully fetched Mastodon RSS via proxy');
        break;
        
      } catch (error) {
        console.log('Mastodon proxy failed:', error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!data) {
      console.log('All Mastodon proxies failed');
      return [];
    }
    
    const activities = [];
    
    // Process up to 5 items (matching recent activity section)
    for (let i = 0; i < Math.min(data.items.length, 5); i++) {
      const item = data.items[i];
      
      if (item.link && item.pubDate) {
        const link = item.link;
        const pubDate = new Date(item.pubDate).toUTCString();
        
        // Use title, description, or content (matching recent activity section)
        let content = item.title || item.description || item.content || 'Posted on Mastodon';
        content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        // Clean up content (matching recent activity section)
        let cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (!cleanContent) {
          cleanContent = 'Posted on Mastodon';
        }
        
        // Truncate if too long (matching recent activity section)
        if (cleanContent.length > 100) {
          cleanContent = cleanContent.substring(0, 100) + '...';
        }
        
        const activity = {
          title: cleanContent,
          description: cleanContent,
          link: link,
          pubDate: pubDate,
          guid: crypto.createHash('md5').update(link).digest('hex'),
          platform: 'Mastodon'
        };
        
        activities.push(activity);
      }
    }
    
    return activities;
  } catch (error) {
    console.log('Error fetching Mastodon activity:', error.message);
    return [];
  }
}

// Function to fetch Nostr activity (matching the recent activity section)
async function fetchNostrActivity() {
  try {
    console.log('Starting Nostr activity fetch...');
    const pubkey = 'npub17reuqeddvdxuh6m0v8q53kk57n3a69su8m8x50u5ucu2qf8zj52qfls7nf';
    
    // For now, skip Nostr as it requires proper nostr-tools library in Node.js
    // The recent activity section uses browser-based nostr-tools which isn't available here
    console.log('Skipping Nostr activity - requires browser-based nostr-tools library');
    return [];
    
  } catch (error) {
    console.log('Error fetching Nostr activity:', error.message);
    return [];
  }
}

// Function to fetch Letterboxd activity (matching the recent activity section)
async function fetchLetterboxdActivity() {
  try {
    const rssUrl = 'https://letterboxd.com/jackokeeffe/rss/';
    
    // Try multiple RSS proxies with cache busting (matching recent activity section)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const cacheBusters = [
      `_t=${timestamp}`,
      `cb=${randomId}`,
      `nocache=${timestamp}`,
      `v=${timestamp}`
    ];
    
    const proxies = [
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}&${cacheBusters[2]}&${cacheBusters[3]}`,
        name: 'AllOrigins',
        handler: (data) => {
          if (data.contents) {
            try {
              const base64Content = data.contents.split(',')[1];
              const xmlContent = Buffer.from(base64Content, 'base64').toString();
              
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
              const items = xmlDoc.querySelectorAll('item');
              
              return {
                items: Array.from(items).map(item => ({
                  title: item.querySelector('title')?.textContent || '',
                  link: item.querySelector('link')?.textContent || '',
                  pubDate: item.querySelector('pubDate')?.textContent || '',
                  description: item.querySelector('description')?.textContent || ''
                }))
              };
            } catch (parseError) {
              console.log('Failed to parse AllOrigins XML:', parseError.message);
              return null;
            }
          }
          return null;
        }
      },
      {
        url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&${cacheBusters[0]}&${cacheBusters[1]}&nocache=1`,
        name: 'RSS2JSON',
        handler: (data) => data.items ? data : null
      },
      {
        url: `https://thingproxy.freeboard.io/fetch/${rssUrl}?_t=${Date.now()}`,
        name: 'ThingProxy',
        handler: (data) => data.items ? data : null
      }
    ];
    
    let data = null;
    let lastError = null;
    
    for (const proxy of proxies) {
      try {
        console.log(`Trying Letterboxd RSS proxy: ${proxy.name}`);
        
        const response = await fetch(proxy.url);
        
        if (!response.ok) {
          throw new Error(`${proxy.name} error: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Use the proxy-specific handler
        data = proxy.handler(responseData);
        
        if (data) {
          console.log(`Successfully fetched via ${proxy.name}`);
          break;
        } else {
          console.log(`${proxy.name} returned invalid data format`);
          continue;
        }
        
      } catch (error) {
        console.log(`${proxy.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!data) {
      console.log('All Letterboxd proxies failed');
      return [];
    }
    
    if (!data.items || data.items.length === 0) {
      console.log('No Letterboxd items found');
      return [];
    }
    
    // Sort items by date (most recent first)
    const sortedItems = data.items.sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB - dateA;
    });
    
    const activities = [];
    
    // Process up to 10 items (matching recent activity section)
    for (let i = 0; i < Math.min(sortedItems.length, 10); i++) {
      const item = sortedItems[i];
      
      if (item.title && item.link && item.pubDate) {
        // Parse movie info from title (matching recent activity section)
        const movieInfo = parseLetterboxdTitle(item.title);
        
        const description = `Watched - ${movieInfo.title}`;
        
        const activity = {
          title: description,
          description: description,
          link: item.link,
          pubDate: new Date(item.pubDate).toUTCString(),
          guid: crypto.createHash('md5').update(item.link).digest('hex'),
          platform: 'Letterboxd'
        };
        
        activities.push(activity);
      }
    }
    
    return activities;
  } catch (error) {
    console.log('Error fetching Letterboxd activity:', error.message);
    return [];
  }
}

// Helper function to parse Letterboxd title (matching recent activity section)
function parseLetterboxdTitle(title) {
  // Example titles:
  // "Presence, 2024 - ★★"
  // "Eddington, 2025 - ★★"
  // "The Place Beyond the Pines, 2012 - ★★★★"
  
  let cleanTitle = title;
  
  // Extract year first
  const yearMatch = title.match(/, (\d{4})/);
  if (yearMatch) {
    // Get title up to the year (including the full year)
    cleanTitle = title.substring(0, title.indexOf(', ' + yearMatch[1]) + 6);
  }
  
  // Remove any rating/stars that might be left
  cleanTitle = cleanTitle.replace(/\s*-\s*[★☆]+.*$/, '');
  
  return {
    title: cleanTitle.trim()
  };
}

// Function to generate RSS XML
function generateRSSXML(activities) {
  const now = new Date().toUTCString();
  
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${feedConfig.title}</title>
        <description>${feedConfig.description}</description>
        <link>${feedConfig.link}</link>
        <language>${feedConfig.language}</language>
        <lastBuildDate>${now}</lastBuildDate>
        <pubDate>${now}</pubDate>
        <ttl>60</ttl>
        <atom:link href="${feedConfig.link}/rss.xml" rel="self" type="application/rss+xml" />
        
`;
  
  for (const activity of activities) {
    rss += `        <item>
            <title>${activity.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
            <description>${activity.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>
            <link>${activity.link}</link>
            <guid>${activity.guid}</guid>
            <pubDate>${activity.pubDate}</pubDate>
            <category>${activity.platform}</category>
        </item>
`;
  }
  
  rss += `    </channel>
</rss>`;
  
  return rss;
}

// Main function
async function main() {
  console.log('Generating RSS feed...');
  
  try {
    // Fetch all activities (matching recent activity section)
    const [githubActivities, mastodonActivities, nostrActivities, letterboxdActivities] = await Promise.allSettled([
      fetchGitHubActivity(),
      fetchMastodonActivity(),
      fetchNostrActivity(),
      fetchLetterboxdActivity()
    ]);
    
    let allActivities = [];
    
    if (githubActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(githubActivities.value);
    }
    
    if (mastodonActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(mastodonActivities.value);
    }
    
    if (nostrActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(nostrActivities.value);
    }
    
    if (letterboxdActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(letterboxdActivities.value);
    }
    
    // Sort by date (most recent first) - matching recent activity section
    allActivities.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    // Limit to exactly 8 items (matching recent activity section)
    allActivities = allActivities.slice(0, 8);
    
    // Generate RSS XML
    const rssXML = generateRSSXML(allActivities);
    
    // Write to file
    fs.writeFileSync('rss.xml', rssXML);
    
    console.log('RSS feed generated successfully!');
    console.log(`File: rss.xml`);
    console.log(`Size: ${rssXML.length.toLocaleString()} bytes`);
    console.log(`Items: ${allActivities.length}`);
    console.log(`Generated: ${new Date().toISOString()}`);
    
    // Log breakdown by platform
    const platformCounts = {};
    allActivities.forEach(activity => {
      platformCounts[activity.platform] = (platformCounts[activity.platform] || 0) + 1;
    });
    console.log('Platform breakdown:', platformCounts);
    
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, fetchGitHubActivity, fetchMastodonActivity, fetchNostrActivity, fetchLetterboxdActivity }; 