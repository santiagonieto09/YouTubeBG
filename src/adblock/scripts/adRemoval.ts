/**
 * Ad Removal Scripts - Balanced Version
 * Effective ad blocking with reasonable performance
 */

import { AdSelector } from '../types';

/**
 * CSS selectors for YouTube ad elements
 */
export const YOUTUBE_AD_SELECTORS: readonly AdSelector[] = [
  // Video player ads
  { selector: '.video-ads', action: 'remove', description: 'Video ad container' },
  { selector: '.ytp-ad-module', action: 'remove', description: 'Ad module in player' },
  { selector: '.ytp-ad-overlay-container', action: 'remove', description: 'Overlay ads' },
  { selector: '.ytp-ad-text-overlay', action: 'remove', description: 'Text overlay' },
  { selector: '.ytp-ad-player-overlay', action: 'remove', description: 'Player overlay' },

  // YouTube Music
  { selector: 'ytmusic-player-bar[has-ads]', action: 'hide', description: 'Player bar ads' },

  // Promoted content
  { selector: 'ytd-promoted-sparkles-web-renderer', action: 'remove', description: 'Promoted' },
  { selector: 'ytd-display-ad-renderer', action: 'remove', description: 'Display ad' },
  { selector: 'ytd-ad-slot-renderer', action: 'remove', description: 'Ad slot' },
  { selector: '#masthead-ad', action: 'remove', description: 'Masthead' },
] as const;

/**
 * Generate ad removal script with video ad skipping
 */
export const generateAdRemovalScript = (): string => {
  const selectors = YOUTUBE_AD_SELECTORS.map(s => s.selector).join(',');

  return `
(function() {
  'use strict';
  
  const SELECTORS = '${selectors}';
  let lastCheck = 0;
  
  // Remove ad elements
  function removeAds() {
    try {
      document.querySelectorAll(SELECTORS).forEach(el => {
        el.style.cssText = 'display:none!important;height:0!important;';
      });
    } catch(e) {}
  }
  
  // Skip video ads - THIS IS CRITICAL
  function skipVideoAd() {
    try {
      // Click skip button
      const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern, [class*="skip-button"]');
      if (skipBtn) {
        skipBtn.click();
        return;
      }
      
      // Check if ad is playing
      const adPlaying = document.querySelector('.ad-showing, .ad-interrupting, [class*="ad-showing"]');
      const video = document.querySelector('video');
      
      if (adPlaying && video && video.duration) {
        // Skip to end of ad
        video.currentTime = video.duration;
        video.playbackRate = 16;
      }
    } catch(e) {}
  }
  
  // Throttled check (runs max every 500ms)
  function checkAds() {
    const now = Date.now();
    if (now - lastCheck < 500) return;
    lastCheck = now;
    
    removeAds();
    skipVideoAd();
  }
  
  // Observe DOM changes
  function startObserver() {
    const observer = new MutationObserver(checkAds);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
  
  // Init
  function init() {
    removeAds();
    skipVideoAd();
    startObserver();
    
    // Backup: check every 2s for video ads that slip through
    setInterval(skipVideoAd, 2000);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
true;
`;
};

/**
 * CSS for instant ad hiding
 */
export const generateAdHidingCSS = (): string => {
  const selectors = YOUTUBE_AD_SELECTORS.map(s => s.selector).join(',');
  return `${selectors},.ad-showing video{display:none!important;height:0!important;}`;
};

/**
 * Preload script  
 */
export const generatePreloadScript = (): string => {
  const css = generateAdHidingCSS().replace(/'/g, "\\'");
  return `
(function(){
  var s=document.createElement('style');
  s.textContent='${css}';
  (document.head||document.documentElement).appendChild(s);
})();
true;
`;
};

export const generateQuickRemovalScript = generatePreloadScript;
