/**
 * Script Injector Service - Optimized
 * 
 * Single Responsibility: Generate lightweight JavaScript injection scripts
 */

import { generateAdRemovalScript, generatePreloadScript, generateAdHidingCSS } from '../scripts/adRemoval';

/**
 * Script Injector Service
 * Provides injectable JavaScript code for WebView
 */
class ScriptInjectorService {
    private cachedMainScript: string | null = null;
    private cachedPreloadScript: string | null = null;

    /**
     * Get the main ad removal script (cached)
     */
    public getMainScript(): string {
        if (!this.cachedMainScript) {
            this.cachedMainScript = generateAdRemovalScript();
        }
        return this.cachedMainScript;
    }

    /**
     * Get preload script for early injection (cached)
     */
    public getPreloadScript(): string {
        if (!this.cachedPreloadScript) {
            this.cachedPreloadScript = generatePreloadScript();
        }
        return this.cachedPreloadScript;
    }

    /**
     * Get the combined injection script for WebView
     */
    public getInjectedJavaScript(): string {
        return this.getMainScript();
    }

    /**
     * Get CSS for ad hiding
     */
    public getAdHidingCSS(): string {
        return generateAdHidingCSS();
    }

    /**
     * Clear cache
     */
    public clearCache(): void {
        this.cachedMainScript = null;
        this.cachedPreloadScript = null;
    }
}

// Singleton
let instance: ScriptInjectorService | null = null;

export const getScriptInjector = (): ScriptInjectorService => {
    if (!instance) {
        instance = new ScriptInjectorService();
    }
    return instance;
};

export const createScriptInjector = (): ScriptInjectorService => {
    return new ScriptInjectorService();
};

export default ScriptInjectorService;
