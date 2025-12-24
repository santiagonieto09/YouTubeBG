/**
 * AdBlock Module - Public API
 */

// Types
export type {
    FilterRule,
    BlockResult,
    BlockerConfig,
    AdSelector,
} from './types';

// Services
export { getUrlBlocker, createUrlBlocker } from './services/UrlBlockerService';
export { getScriptInjector, createScriptInjector } from './services/ScriptInjector';

// Filters
export { AD_DOMAINS, AD_URL_PATTERNS, ALLOW_PATTERNS } from './filters/youtube-ads';
