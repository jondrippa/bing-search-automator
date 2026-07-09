(function () {
  'use strict';

  // This content script runs on bing.com pages
  // It simulates human behavior like scrolling and reading

  const SCROLL_CONFIG = {
    scrollAmount: 35,
    scrollInterval: 180,
    maxScroll: 350,
  };

  // Simulate human reading by scrolling
  function simulateHumanReading() {
    let scrolled = 0;
    const scrollInterval = setInterval(() => {
      if (scrolled < SCROLL_CONFIG.maxScroll) {
        window.scrollBy(0, SCROLL_CONFIG.scrollAmount);
        scrolled += SCROLL_CONFIG.scrollAmount;
      } else {
        clearInterval(scrollInterval);
      }
    }, SCROLL_CONFIG.scrollInterval);
  }

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'simulateReading') {
      simulateHumanReading();
      sendResponse({ success: true });
    }
  });

  // Auto-trigger reading simulation on search results page
  if (window.location.hostname === 'www.bing.com' && window.location.search.includes('q=')) {
    setTimeout(simulateHumanReading, 2000);
  }
})();
