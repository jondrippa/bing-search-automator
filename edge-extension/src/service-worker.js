(function () {
  'use strict';

  // Import sync manager
  importScripts('sync-manager.js');

  // Anti-Detection Configuration
  const ANTI_DETECTION_CONFIG = {
    // Randomize search intervals to avoid detection
    searchInterval: [15000, 32000],
    // Simulate human reading time
    readScrollTime: 12000,
    // Randomize user-agent on each search
    rotateUserAgent: true,
    // Add random delays between requests
    randomDelayRange: [500, 2000],
    // Cooldown after every 3 searches to mimic human behavior
    strictFifteenMinCooldown: false,
  };

  const FALLBACK_SEARCH_TERMS = [
    'iPhone', 'Tesla', 'NVIDIA', 'Microsoft', 'weather', 'news today',
    'best movies', 'recipe', 'travel', 'technology', 'sports scores',
    'stock market', 'music playlist', 'fitness tips', 'book reviews'
  ];

  // User-Agent pool for rotation (anti-detection)
  const USER_AGENT_POOL = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
  ];

  // Tier-based search limits (2026 Bing Rewards)
  const TIER_LIMITS = {
    desktop: { member: 3, silver: 6, gold: 12, legacy: 30 },
    mobile: { member: 2, silver: 4, gold: 20, legacy: 20 }
  };

  // State management
  let state = {
    isSearching: false,
    currentMode: 'desktop', // 'desktop' or 'mobile'
    searchCount: { desktop: 0, mobile: 0 },
    pointsEarned: { desktop: 0, mobile: 0 },
    generatedKeywords: [],
    tier: 'gold',
  };

  // Initialize state from storage
  chrome.storage.local.get(['state'], (result) => {
    if (result.state) {
      state = { ...state, ...result.state };
    }
  });

  // Save state to storage
  function saveState() {
    chrome.storage.local.set({ state });
  }

  // Fetch localized keywords based on IP
  async function fetchLocalizedKeywords() {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': getRandomUserAgent(),
        }
      });
      
      if (!response.ok) throw new Error('IP API limit or error');
      
      const data = await response.json();
      const city = data.city || 'local';
      const country = data.country_name || 'US';

      const localTemplates = [
        `weather in ${city}`,
        `news today in ${city}`,
        `best restaurants in ${city}`,
        `things to do in ${city}`,
        `local events in ${city} ${country}`,
        `${city} local sports teams`,
        `${city} tourist attractions`,
        `jobs in ${city}`,
        `history of ${city}`,
        `directions to closest park in ${city}`,
        `${city} real estate trends`,
        `movies playing near ${city}`
      ];
      
      return shuffleArray(localTemplates);
    } catch (e) {
      console.warn('IP lookup failed, using fallback terms', e);
      return shuffleArray(FALLBACK_SEARCH_TERMS);
    }
  }

  // Get random user-agent for anti-detection
  function getRandomUserAgent() {
    return USER_AGENT_POOL[Math.floor(Math.random() * USER_AGENT_POOL.length)];
  }

  // Shuffle array for randomization
  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // Get random delay
  function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Execute search
  async function executeSearch(keyword) {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&PC=U316&FORM=CHROMN`;
    
    // Add random delay before opening search
    await new Promise(resolve => 
      setTimeout(resolve, getRandomDelay(...ANTI_DETECTION_CONFIG.randomDelayRange))
    );

    // Open search in current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { url: searchUrl });
      }
    });
  }

  // Start automatic search process
  async function startAutomaticSearch() {
    state.isSearching = true;
    saveState();

    const maxSearches = TIER_LIMITS[state.currentMode][state.tier];
    const currentCount = state.searchCount[state.currentMode];

    if (currentCount >= maxSearches) {
      state.isSearching = false;
      saveState();
      notifyPopup({ status: 'completed', message: `${state.currentMode.toUpperCase()} tasks completed` });
      return;
    }

    state.generatedKeywords = await fetchLocalizedKeywords();
    saveState();

    // Schedule searches
    for (let i = currentCount; i < maxSearches; i++) {
      const delay = getRandomDelay(...ANTI_DETECTION_CONFIG.searchInterval);
      
      setTimeout(() => {
        if (state.isSearching) {
          const keyword = state.generatedKeywords[i % state.generatedKeywords.length];
          executeSearch(keyword);
          state.searchCount[state.currentMode]++;
          state.pointsEarned[state.currentMode] += 5;
          saveState();
          updateSyncStats();
          notifyPopup({ status: 'searching', count: state.searchCount[state.currentMode], max: maxSearches });
        }
      }, delay * (i - currentCount + 1));
    }
  }

  // Start single manual search
  async function startManualSearch() {
    state.generatedKeywords = await fetchLocalizedKeywords();
    const keyword = state.generatedKeywords[Math.floor(Math.random() * state.generatedKeywords.length)];
    
    executeSearch(keyword);
    state.searchCount[state.currentMode]++;
    state.pointsEarned[state.currentMode] += 5; // Estimate 5 points per search
    saveState();
    updateSyncStats();
    notifyPopup({ status: 'manual_search', count: state.searchCount[state.currentMode] });
  }

  // Pause/Stop search
  function stopSearch() {
    state.isSearching = false;
    saveState();
    notifyPopup({ status: 'stopped' });
  }

  // Notify popup of state changes
  function notifyPopup(data) {
    chrome.runtime.sendMessage({ type: 'stateUpdate', data: { ...state, ...data } }).catch(() => {});
  }

  // Update sync manager with stats
  function updateSyncStats() {
    if (typeof syncManager !== 'undefined') {
      syncManager.updateSearchCount(state.currentMode);
      syncManager.updatePoints(state.pointsEarned[state.currentMode]);
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getState') {
      sendResponse(state);
    } else if (request.type === 'SYNC_DATA_FROM_MOBILE') {
      // Receive sync data from mobile app
      if (typeof syncManager !== 'undefined' && request.data) {
        syncManager.syncData = { ...syncManager.syncData, ...request.data };
        syncManager.saveSyncData();
      }
      sendResponse({ success: true });
    } else if (request.type === 'startAutomatic') {
      state.currentMode = request.mode || 'desktop';
      state.searchCount[state.currentMode] = 0;
      startAutomaticSearch();
      sendResponse({ success: true });
    } else if (request.type === 'startManual') {
      state.currentMode = request.mode || 'desktop';
      startManualSearch();
      sendResponse({ success: true });
    } else if (request.type === 'stop') {
      stopSearch();
      sendResponse({ success: true });
    } else if (request.type === 'setTier') {
      state.tier = request.tier;
      saveState();
      sendResponse({ success: true });
    } else if (request.type === 'setMode') {
      state.currentMode = request.mode;
      saveState();
      sendResponse({ success: true });
    }
  });
})();
