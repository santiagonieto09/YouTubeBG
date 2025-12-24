/**
 * Ad Blocker Types
 * Interfaces and types for the ad blocking system
 */

/**
 * Represents a filter rule parsed from EasyList-style syntax
 */
export interface FilterRule {
    /** Original pattern from the filter list */
    pattern: string;
    /** Compiled regex for fast matching */
    regex: RegExp;
    /** Whether this rule blocks or allows (exception) */
    type: 'block' | 'allow';
    /** Optional: only apply to specific domains */
    domains?: string[];
    /** Optional: only apply to specific resource types */
    resourceTypes?: ResourceType[];
}

/**
 * Types of resources that can be blocked
 */
export type ResourceType =
    | 'script'
    | 'image'
    | 'stylesheet'
    | 'xmlhttprequest'
    | 'subdocument'
    | 'media'
    | 'other';

/**
 * Result of checking a URL against filter rules
 */
export interface BlockResult {
    /** Whether the URL should be blocked */
    blocked: boolean;
    /** The rule that matched, if any */
    matchedRule?: FilterRule;
    /** Reason for the decision */
    reason?: string;
}

/**
 * Configuration for the URL blocker service
 */
export interface BlockerConfig {
    /** Whether blocking is enabled */
    enabled: boolean;
    /** Whether to log blocked URLs (for debugging) */
    logBlocked: boolean;
    /** Custom rules to add on top of filter lists */
    customRules?: string[];
}

/**
 * DOM element selector for JS-based removal
 */
export interface AdSelector {
    /** CSS selector to match elements */
    selector: string;
    /** Human-readable description */
    description: string;
    /** Whether to hide or remove the element */
    action: 'hide' | 'remove';
}

/**
 * Script injection configuration
 */
export interface InjectionConfig {
    /** Scripts to run on page load */
    onLoad: string[];
    /** Scripts to run on DOM mutations */
    onMutation: string[];
    /** Selectors for elements to remove */
    selectors: AdSelector[];
}
