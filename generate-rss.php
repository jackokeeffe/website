<?php
/**
 * RSS Feed Generator Script
 * 
 * This script generates a static RSS feed by calling the dynamic RSS script
 * and saving the output to rss.xml. You can run this manually or set up a cron job.
 * 
 * Usage: php generate-rss.php
 */

// Include the RSS generation logic
ob_start();
include 'rss.php';
$rssContent = ob_get_clean();

// Write to static file
$result = file_put_contents('rss.xml', $rssContent);

if ($result !== false) {
    echo "RSS feed generated successfully!\n";
    echo "File: rss.xml\n";
    echo "Size: " . number_format($result) . " bytes\n";
    echo "Generated: " . date('Y-m-d H:i:s') . "\n";
} else {
    echo "Error: Failed to generate RSS feed\n";
    exit(1);
}
?> 