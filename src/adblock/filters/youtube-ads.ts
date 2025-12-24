/**
 * YouTube & Google Ads Filter List
 * Domains and URL patterns to block
 * Based on EasyList and YouTube-specific patterns
 */

/**
 * Domains that serve ads - these will be completely blocked
 * Format: domain names without protocol
 */
export const AD_DOMAINS: readonly string[] = [
    // Google Ads
    'googlesyndication.com',
    'googleadservices.com',
    'googleads.g.doubleclick.net',
    'doubleclick.net',
    'ad.doubleclick.net',
    'pagead2.googlesyndication.com',
    'adservice.google.com',
    'www.googleadservices.com',

    // Google Analytics & Tracking (optional)
    'google-analytics.com',
    'googletagmanager.com',
    'googletagservices.com',

    // YouTube specific ad servers
    'youtube.cleverads.vn',
    'yt3.ggpht.com', // Some ad images

    // Generic ad networks
    'serving-sys.com',
    'advertising.com',
    'adnxs.com',
    'adsrvr.org',
    'bidswitch.net',
    'taboola.com',
    'outbrain.com',
    'criteo.com',
    'amazon-adsystem.com',
    'moatads.com',
    'scorecardresearch.com',
] as const;

/**
 * URL patterns to block (supports wildcards)
 * Format: EasyList-style patterns
 */
export const AD_URL_PATTERNS: readonly string[] = [
    // YouTube API ad endpoints
    '/api/stats/ads',
    '/api/stats/qoe?',
    '/pagead/',
    '/ptracking',
    '/get_video_info?*adformat',
    '/get_midroll_info',
    '/api/ads/',
    '/youtubei/v1/player/ad_break',

    // YouTube ad parameters in URLs
    '&ad_type=',
    '&adurl=',
    '?adurl=',
    '&ad_flags=',
    'annotation_id=',
    '&cta_type=',

    // Tracking pixels and beacons
    '/gen_204?',
    '/log_event?',
    '/pcs/activeview',
    '/pagead/viewthroughconversion',

    // Ad-related scripts
    '/base.js', // Main player - be careful, might break player
    '/desktop_polymer.js', // Contains ad logic

    // Sponsored content  
    '&adsid=',
    '&ad_channel_code=',
] as const;

/**
 * URL patterns that should be allowed even if they match other rules (exceptions)
 */
export const ALLOW_PATTERNS: readonly string[] = [
    // Don't block actual video content
    '/videoplayback?',
    '/manifest/',
    '/api/timedtext', // Subtitles
    '/generate_204', // Connectivity checks
] as const;

/**
 * Request types to block (not all requests, just specific types)
 */
export const BLOCKED_REQUEST_TYPES = [
    'script', // Ad scripts
    'xmlhttprequest', // AJAX ad requests
    'image', // Tracking pixels
] as const;
