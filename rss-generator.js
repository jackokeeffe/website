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

// RSS Feed Configuration
const feedConfig = {
  title: "Jack O'Keeffe - Recent Activity",
  description: "Recent activity from Jack O'Keeffe across GitHub, Mastodon, Nostr, and Letterboxd",
  link: "https://jackokeeffe.com",
  language: "en-US",
  author: "Jack O'Keeffe",
  email: "jokeeffe@protonmail.ch"
};

// Function to fetch GitHub activity
async function fetchGitHubActivity() {
  try {
    const response = await fetch('https://api.github.com/users/jackokeeffe/events?per_page=10', {
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

// Function to fetch Mastodon activity
async function fetchMastodonActivity() {
  try {
    const response = await fetch('https://mastodon.social/@jackokeeffe.rss', {
      headers: {
        'User-Agent': 'JackOKeeffe-RSS/1.0'
      }
    });
    
    if (!response.ok) {
      console.log('Mastodon RSS error:', response.status);
      return [];
    }
    
    const xmlText = await response.text();
    const activities = [];
    
    // Simple XML parsing for RSS
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
    
    if (items) {
      for (let i = 0; i < Math.min(items.length, 5); i++) {
        const item = items[i];
        
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        
        if (titleMatch && linkMatch && pubDateMatch) {
          const title = titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          const link = linkMatch[1];
          const pubDate = new Date(pubDateMatch[1]).toUTCString();
          
          // Clean up content
          let cleanContent = title.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          if (!cleanContent) {
            cleanContent = 'Posted on Mastodon';
          }
          
                     activities.push({
             title: cleanContent,
             description: cleanContent,
             link: link,
             pubDate: pubDate,
             guid: crypto.createHash('md5').update(link).digest('hex'),
             platform: 'Mastodon'
           });
        }
      }
    }
    
    return activities;
  } catch (error) {
    console.log('Error fetching Mastodon activity:', error.message);
    return [];
  }
}

// Function to fetch Letterboxd activity
async function fetchLetterboxdActivity() {
  try {
    const response = await fetch('https://letterboxd.com/jackokeeffe/rss/', {
      headers: {
        'User-Agent': 'JackOKeeffe-RSS/1.0'
      }
    });
    
    if (!response.ok) {
      console.log('Letterboxd RSS error:', response.status);
      return [];
    }
    
    const xmlText = await response.text();
    const activities = [];
    
    // Simple XML parsing for RSS
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
    
    if (items) {
      for (let i = 0; i < Math.min(items.length, 5); i++) {
        const item = items[i];
        
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        
        if (titleMatch && linkMatch && pubDateMatch) {
          const title = titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          const link = linkMatch[1];
          const pubDate = new Date(pubDateMatch[1]).toUTCString();
          
          // Parse movie info from title (e.g., "Movie Title, 2024 - ★★★★")
          const cleanTitle = title.replace(/\s*-\s*[★☆]+.*$/, '');
          const yearMatch = cleanTitle.match(/, (\d{4})/);
          const finalTitle = yearMatch ? cleanTitle.replace(/, \d{4}/, '') : cleanTitle;
          
                     activities.push({
             title: `Watched - ${finalTitle.trim()}`,
             description: `Watched - ${finalTitle.trim()}`,
             link: link,
             pubDate: pubDate,
             guid: crypto.createHash('md5').update(link).digest('hex'),
             platform: 'Letterboxd'
           });
        }
      }
    }
    
    return activities;
  } catch (error) {
    console.log('Error fetching Letterboxd activity:', error.message);
    return [];
  }
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
    // Fetch all activities
    const [githubActivities, mastodonActivities, letterboxdActivities] = await Promise.allSettled([
      fetchGitHubActivity(),
      fetchMastodonActivity(),
      fetchLetterboxdActivity()
    ]);
    
    let allActivities = [];
    
    if (githubActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(githubActivities.value);
    }
    
    if (mastodonActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(mastodonActivities.value);
    }
    
    if (letterboxdActivities.status === 'fulfilled') {
      allActivities = allActivities.concat(letterboxdActivities.value);
    }
    
    // Sort by date (most recent first)
    allActivities.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    // Limit to 20 items
    allActivities = allActivities.slice(0, 20);
    
    // Generate RSS XML
    const rssXML = generateRSSXML(allActivities);
    
    // Write to file
    fs.writeFileSync('rss.xml', rssXML);
    
    console.log('RSS feed generated successfully!');
    console.log(`File: rss.xml`);
    console.log(`Size: ${rssXML.length.toLocaleString()} bytes`);
    console.log(`Items: ${allActivities.length}`);
    console.log(`Generated: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, fetchGitHubActivity, fetchMastodonActivity, fetchLetterboxdActivity }; 