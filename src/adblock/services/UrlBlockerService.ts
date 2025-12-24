/**
 * URL Blocker Service
 * 
 * Single Responsibility: Evaluate URLs against filter rules and determine if they should be blocked
 * 
 * This service does NOT load filters - it only evaluates URLs.
 * Filters are injected via constructor for better testability.
 */

import { BlockResult, BlockerConfig } from '../types';
import { AD_DOMAINS, AD_URL_PATTERNS, ALLOW_PATTERNS } from '../filters/youtube-ads';

// Default configuration
const DEFAULT_CONFIG: BlockerConfig = {
    enabled: true,
    logBlocked: __DEV__, // Only log in development
    customRules: [],
};

/**
 * Compiled filter sets for O(1) domain lookups
 */
interface CompiledFilters {
    blockedDomains: Set<string>;
    blockedPatterns: RegExp[];
    allowPatterns: RegExp[];
}

/**
 * URL Blocker Service
 * Evaluates URLs against pre-compiled filter rules
 */
class UrlBlockerService {
    private config: BlockerConfig;
    private filters: CompiledFilters;
    private blockedCount: number = 0;

    constructor(config: Partial<BlockerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.filters = this.compileFilters();
    }

    /**
     * Compile filter lists into optimized data structures
     * Called once at initialization
     */
    private compileFilters(): CompiledFilters {
        // Use Set for O(1) domain lookups
        const blockedDomains = new Set<string>(AD_DOMAINS);

        // Compile URL patterns to RegExp
        const blockedPatterns = AD_URL_PATTERNS.map(pattern =>
            this.patternToRegex(pattern)
        );

        // Compile allow patterns
        const allowPatterns = ALLOW_PATTERNS.map(pattern =>
            this.patternToRegex(pattern)
        );

        return { blockedDomains, blockedPatterns, allowPatterns };
    }

    /**
     * Convert EasyList-style pattern to RegExp
     */
    private patternToRegex(pattern: string): RegExp {
        // Escape special regex characters except *
        let regexStr = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');

        return new RegExp(regexStr, 'i');
    }

    /**
     * Extract domain from URL
     */
    private extractDomain(url: string): string | null {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.toLowerCase();
        } catch {
            // Handle relative URLs or malformed URLs
            const match = url.match(/^(?:https?:\/\/)?([^\/\?]+)/i);
            return match ? match[1].toLowerCase() : null;
        }
    }

    /**
     * Check if domain is in blocked list
     */
    private isDomainBlocked(domain: string): boolean {
        // Direct match
        if (this.filters.blockedDomains.has(domain)) {
            return true;
        }

        // Check subdomains (e.g., ads.example.com should match example.com)
        const parts = domain.split('.');
        for (let i = 1; i < parts.length - 1; i++) {
            const parentDomain = parts.slice(i).join('.');
            if (this.filters.blockedDomains.has(parentDomain)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if URL matches any blocked pattern
     */
    private matchesBlockedPattern(url: string): boolean {
        return this.filters.blockedPatterns.some(regex => regex.test(url));
    }

    /**
     * Check if URL matches any allow pattern (exception)
     */
    private matchesAllowPattern(url: string): boolean {
        return this.filters.allowPatterns.some(regex => regex.test(url));
    }

    /**
     * Main method: Check if a URL should be blocked
     * 
     * @param url - The URL to check
     * @returns BlockResult with blocked status and reason
     */
    public shouldBlock(url: string): BlockResult {
        // If blocking is disabled, allow everything
        if (!this.config.enabled) {
            return { blocked: false, reason: 'Blocking disabled' };
        }

        // Empty or invalid URLs should not be blocked
        if (!url || typeof url !== 'string') {
            return { blocked: false, reason: 'Invalid URL' };
        }

        // Check allow list first (exceptions take priority)
        if (this.matchesAllowPattern(url)) {
            return { blocked: false, reason: 'Matched allow pattern' };
        }

        // Check domain-based blocking
        const domain = this.extractDomain(url);
        if (domain && this.isDomainBlocked(domain)) {
            this.logBlocked(url, `Blocked domain: ${domain}`);
            return {
                blocked: true,
                reason: `Blocked domain: ${domain}`,
                matchedRule: { pattern: domain, regex: new RegExp(domain), type: 'block' }
            };
        }

        // Check URL pattern matching
        if (this.matchesBlockedPattern(url)) {
            this.logBlocked(url, 'Matched blocked pattern');
            return {
                blocked: true,
                reason: 'Matched blocked URL pattern',
                matchedRule: { pattern: url, regex: new RegExp(''), type: 'block' }
            };
        }

        // URL is allowed
        return { blocked: false };
    }

    /**
     * Log blocked URL (for debugging)
     */
    private logBlocked(url: string, reason: string): void {
        if (this.config.logBlocked) {
            this.blockedCount++;
            console.log(`[AdBlock] Blocked (${this.blockedCount}): ${reason}`);
            console.log(`  URL: ${url.substring(0, 100)}...`);
        }
    }

    /**
     * Get statistics
     */
    public getStats(): { blockedCount: number; enabled: boolean } {
        return {
            blockedCount: this.blockedCount,
            enabled: this.config.enabled,
        };
    }

    /**
     * Enable or disable blocking
     */
    public setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
    }

    /**
     * Reset blocked count
     */
    public resetStats(): void {
        this.blockedCount = 0;
    }
}

// Singleton instance for the app
let instance: UrlBlockerService | null = null;

/**
 * Get the singleton URL blocker instance
 */
export const getUrlBlocker = (config?: Partial<BlockerConfig>): UrlBlockerService => {
    if (!instance) {
        instance = new UrlBlockerService(config);
    }
    return instance;
};

/**
 * Create a new URL blocker instance (for testing)
 */
export const createUrlBlocker = (config?: Partial<BlockerConfig>): UrlBlockerService => {
    return new UrlBlockerService(config);
};

export default UrlBlockerService;
