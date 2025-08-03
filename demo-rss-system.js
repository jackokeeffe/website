#!/usr/bin/env node

/**
 * Demo script for the RSS update system
 * 
 * This script demonstrates how the RSS feed updates when new activity is detected.
 * 
 * Usage: node demo-rss-system.js
 */

const PORT = process.env.PORT || 3000;

async function demoRSSSystem() {
  console.log('🎬 RSS Update System Demo');
  console.log('========================');
  
  try {
    // Step 1: Check current RSS feed
    console.log('\n1️⃣ Checking current RSS feed...');
    const rssResponse = await fetch(`http://localhost:${PORT}/rss.xml`);
    if (rssResponse.ok) {
      const rssContent = await rssResponse.text();
      const itemCount = (rssContent.match(/<item>/g) || []).length;
      console.log(`✅ RSS feed has ${itemCount} items`);
    } else {
      console.log('❌ Could not fetch RSS feed');
    }
    
    // Step 2: Simulate new activity detection
    console.log('\n2️⃣ Simulating new activity detection...');
    const updateResponse = await fetch(`http://localhost:${PORT}/update-rss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        trigger: 'demo_activity',
        source: 'demo_script'
      })
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ RSS feed updated successfully!');
      console.log(`📅 Updated at: ${result.timestamp}`);
    } else {
      console.log('❌ RSS update failed');
    }
    
    // Step 3: Verify the update
    console.log('\n3️⃣ Verifying RSS feed update...');
    const newRssResponse = await fetch(`http://localhost:${PORT}/rss.xml`);
    if (newRssResponse.ok) {
      const newRssContent = await newRssResponse.text();
      const newItemCount = (newRssContent.match(/<item>/g) || []).length;
      console.log(`✅ RSS feed now has ${newItemCount} items`);
      
      // Extract last build date
      const lastBuildMatch = newRssContent.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);
      if (lastBuildMatch) {
        console.log(`🕒 Last updated: ${lastBuildMatch[1]}`);
      }
    } else {
      console.log('❌ Could not verify RSS feed update');
    }
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📋 How it works:');
    console.log('  1. Recent activity section loads new activity');
    console.log('  2. JavaScript detects recent activity (within 1 hour)');
    console.log('  3. Automatically triggers RSS feed update');
    console.log('  4. RSS XML file is regenerated with new content');
    console.log('  5. RSS feed is immediately available with fresh data');
    
  } catch (error) {
    console.log('❌ Demo failed:', error.message);
    console.log('Make sure the server is running with: npm start');
  }
}

// Run the demo
demoRSSSystem(); 