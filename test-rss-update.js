#!/usr/bin/env node

/**
 * Test script for RSS feed updates
 * 
 * This script tests the RSS update functionality by making a request to the server.
 * 
 * Usage: node test-rss-update.js
 */

const PORT = process.env.PORT || 3000;

async function testRSSUpdate() {
  try {
    console.log('🧪 Testing RSS update functionality...');
    
    const response = await fetch(`http://localhost:${PORT}/update-rss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        trigger: 'test_activity'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ RSS update test successful!');
      console.log('Result:', result);
    } else {
      console.log('❌ RSS update test failed:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Error testing RSS update:', error.message);
    console.log('Make sure the server is running with: npm start');
  }
}

// Run the test
testRSSUpdate(); 