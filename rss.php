<?php
header('Content-Type: application/rss+xml; charset=UTF-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

// RSS Feed Configuration
$feedTitle = "Jack O'Keeffe - Recent Activity";
$feedDescription = "Recent activity from Jack O'Keeffe across GitHub, Mastodon, Nostr, and Letterboxd";
$feedLink = "https://jackokeeffe.com";
$feedLanguage = "en-US";
$feedAuthor = "Jack O'Keeffe";
$feedEmail = "jokeeffe@protonmail.ch";

// Function to fetch GitHub activity
function fetchGitHubActivity() {
    $url = 'https://api.github.com/users/jackokeeffe/events?per_page=10';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: JackOKeeffe-RSS/1.0',
                'Accept: application/vnd.github.v3+json'
            ]
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        return [];
    }
    
    $events = json_decode($response, true);
    if (!$events) {
        return [];
    }
    
    $activities = [];
    foreach ($events as $event) {
        $description = '';
        $link = '';
        
        switch ($event['type']) {
            case 'PushEvent':
                $commitCount = count($event['payload']['commits'] ?? []);
                $description = "Pushed {$commitCount} commit" . ($commitCount !== 1 ? 's' : '') . " to {$event['repo']['name']}";
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            case 'CreateEvent':
                $createType = $event['payload']['ref_type'] === 'repository' ? 'repository' : 
                             ($event['payload']['ref_type'] === 'branch' ? 'branch' : 'resource');
                $description = "Created {$createType} " . ($event['payload']['ref'] ?? $event['repo']['name']);
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            case 'WatchEvent':
                $description = "Starred {$event['repo']['name']}";
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            case 'ForkEvent':
                $description = "Forked {$event['repo']['name']}";
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            case 'PullRequestEvent':
                $action = ucfirst($event['payload']['action']);
                $prTitle = $event['payload']['pull_request']['title'] ?? 'pull request';
                $description = "{$action} pull request: {$prTitle}";
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            case 'IssuesEvent':
                $action = ucfirst($event['payload']['action']);
                $issueTitle = $event['payload']['issue']['title'] ?? 'issue';
                $description = "{$action} issue: {$issueTitle}";
                $link = "https://github.com/{$event['repo']['name']}";
                break;
            default:
                continue 2; // Skip unknown event types
        }
        
        $activities[] = [
            'title' => $description,
            'description' => $description,
            'link' => $link,
            'pubDate' => date('r', strtotime($event['created_at'])),
            'guid' => $event['id'],
            'platform' => 'GitHub'
        ];
    }
    
    return $activities;
}

// Function to fetch Mastodon activity
function fetchMastodonActivity() {
    $rssUrl = 'https://mastodon.social/@jackokeeffe.rss';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: JackOKeeffe-RSS/1.0'
            ]
        ]
    ]);
    
    $response = file_get_contents($rssUrl, false, $context);
    if ($response === false) {
        return [];
    }
    
    $xml = simplexml_load_string($response);
    if (!$xml) {
        return [];
    }
    
    $activities = [];
    foreach ($xml->channel->item as $item) {
        $title = (string)$item->title;
        $description = (string)$item->description;
        $link = (string)$item->link;
        $pubDate = (string)$item->pubDate;
        
        // Clean up content
        $cleanContent = strip_tags($description);
        $cleanContent = preg_replace('/\s+/', ' ', $cleanContent);
        $cleanContent = trim($cleanContent);
        
        if (empty($cleanContent)) {
            $cleanContent = 'Posted on Mastodon';
        }
        
        $activities[] = [
            'title' => $cleanContent,
            'description' => $cleanContent,
            'link' => $link,
            'pubDate' => date('r', strtotime($pubDate)),
            'guid' => md5($link),
            'platform' => 'Mastodon'
        ];
    }
    
    return array_slice($activities, 0, 5); // Limit to 5 posts
}

// Function to fetch Letterboxd activity
function fetchLetterboxdActivity() {
    $rssUrl = 'https://letterboxd.com/jackokeeffe/rss/';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: JackOKeeffe-RSS/1.0'
            ]
        ]
    ]);
    
    $response = file_get_contents($rssUrl, false, $context);
    if ($response === false) {
        return [];
    }
    
    $xml = simplexml_load_string($response);
    if (!$xml) {
        return [];
    }
    
    $activities = [];
    foreach ($xml->channel->item as $item) {
        $title = (string)$item->title;
        $link = (string)$item->link;
        $pubDate = (string)$item->pubDate;
        
        // Parse movie info from title (e.g., "Movie Title, 2024 - ★★★★")
        $movieInfo = parseLetterboxdTitle($title);
        
        $activities[] = [
            'title' => "Watched - {$movieInfo['title']}",
            'description' => "Watched - {$movieInfo['title']}",
            'link' => $link,
            'pubDate' => date('r', strtotime($pubDate)),
            'guid' => md5($link),
            'platform' => 'Letterboxd'
        ];
    }
    
    return array_slice($activities, 0, 5); // Limit to 5 activities
}

// Helper function to parse Letterboxd titles
function parseLetterboxdTitle($title) {
    // Remove rating/stars
    $cleanTitle = preg_replace('/\s*-\s*[★☆]+.*$/', '', $title);
    
    // Extract year
    $year = '';
    if (preg_match('/, (\d{4})/', $cleanTitle, $matches)) {
        $year = $matches[1];
        $cleanTitle = preg_replace('/, \d{4}/', '', $cleanTitle);
    }
    
    return [
        'title' => trim($cleanTitle),
        'year' => $year
    ];
}

// Fetch all activities
$allActivities = [];
$allActivities = array_merge($allActivities, fetchGitHubActivity());
$allActivities = array_merge($allActivities, fetchMastodonActivity());
$allActivities = array_merge($allActivities, fetchLetterboxdActivity());

// Sort by date (most recent first)
usort($allActivities, function($a, $b) {
    return strtotime($b['pubDate']) - strtotime($a['pubDate']);
});

// Limit to 20 items
$allActivities = array_slice($allActivities, 0, 20);

// Generate RSS XML
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title><?php echo htmlspecialchars($feedTitle); ?></title>
        <description><?php echo htmlspecialchars($feedDescription); ?></description>
        <link><?php echo htmlspecialchars($feedLink); ?></link>
        <language><?php echo htmlspecialchars($feedLanguage); ?></language>
        <lastBuildDate><?php echo date('r'); ?></lastBuildDate>
        <pubDate><?php echo date('r'); ?></pubDate>
        <ttl>60</ttl>
        <atom:link href="<?php echo htmlspecialchars($feedLink); ?>/rss.php" rel="self" type="application/rss+xml" />
        
        <?php foreach ($allActivities as $activity): ?>
        <item>
            <title><?php echo htmlspecialchars($activity['title']); ?></title>
            <description><?php echo htmlspecialchars($activity['description']); ?></description>
            <link><?php echo htmlspecialchars($activity['link']); ?></link>
            <guid><?php echo htmlspecialchars($activity['guid']); ?></guid>
            <pubDate><?php echo $activity['pubDate']; ?></pubDate>
            <category><?php echo htmlspecialchars($activity['platform']); ?></category>
        </item>
        <?php endforeach; ?>
    </channel>
</rss> 