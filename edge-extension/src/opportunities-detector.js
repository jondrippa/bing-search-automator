/**
 * Opportunities Detector for Bing Rewards
 * Monitors the Bing Rewards page and detects earning opportunities
 */

// Earning opportunity patterns to detect
const OPPORTUNITY_PATTERNS = {
  quiz: {
    selectors: [
      '[data-quiz]',
      '.quiz-container',
      '[class*="quiz"]',
      'div:contains("quiz")',
      'div:contains("Quiz")',
    ],
    keywords: ['quiz', 'trivia', 'question'],
    points: 50,
    icon: '🧠',
  },
  survey: {
    selectors: [
      '[data-survey]',
      '.survey-container',
      '[class*="survey"]',
      'div:contains("survey")',
    ],
    keywords: ['survey', 'feedback', 'opinion'],
    points: 100,
    icon: '📋',
  },
  shopping: {
    selectors: [
      '[data-shopping]',
      '.shopping-container',
      '[class*="shopping"]',
      '[class*="shop"]',
      'div:contains("shop")',
    ],
    keywords: ['shop', 'shopping', 'store', 'purchase'],
    points: 200,
    icon: '🛍️',
  },
  xbox: {
    selectors: [
      '[data-xbox]',
      '.xbox-container',
      '[class*="xbox"]',
      '[class*="game"]',
      'div:contains("Xbox")',
    ],
    keywords: ['xbox', 'game', 'play'],
    points: 150,
    icon: '🎮',
  },
  dailyTask: {
    selectors: [
      '[data-daily]',
      '.daily-container',
      '[class*="daily"]',
      '[class*="task"]',
      'div:contains("daily")',
    ],
    keywords: ['daily', 'task', 'set', 'explore'],
    points: 120,
    icon: '✨',
  },
};

/**
 * Detect earning opportunities on the page
 */
function detectOpportunities() {
  const opportunities = [];

  Object.entries(OPPORTUNITY_PATTERNS).forEach(([category, pattern]) => {
    // Check for elements matching selectors
    pattern.selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const text = element.textContent.toLowerCase();

          // Check if element contains relevant keywords
          if (pattern.keywords.some((keyword) => text.includes(keyword))) {
            const opportunity = {
              id: `${category}-${opportunities.length}`,
              category,
              title: element.textContent.substring(0, 100),
              description: `Complete this ${category} activity to earn points`,
              pointsAvailable: pattern.points,
              timeToComplete: 5,
              icon: pattern.icon,
              element: element,
              url: window.location.href,
            };

            // Avoid duplicates
            if (
              !opportunities.some(
                (opp) =>
                  opp.title === opportunity.title &&
                  opp.category === opportunity.category
              )
            ) {
              opportunities.push(opportunity);
            }
          }
        });
      } catch (e) {
        // Selector might not be valid, continue
      }
    });
  });

  return opportunities;
}

/**
 * Monitor for new opportunities periodically
 */
function startMonitoring(interval = 30000) {
  // Check every 30 seconds
  setInterval(() => {
    const opportunities = detectOpportunities();

    if (opportunities.length > 0) {
      // Send notification to popup
      chrome.runtime.sendMessage({
        type: 'OPPORTUNITIES_DETECTED',
        data: opportunities,
      });
    }
  }, interval);
}

/**
 * Highlight detected opportunities on the page
 */
function highlightOpportunities() {
  const opportunities = detectOpportunities();

  opportunities.forEach((opp) => {
    if (opp.element) {
      // Add visual indicator
      opp.element.style.border = '3px solid #0078d4';
      opp.element.style.borderRadius = '8px';
      opp.element.style.padding = '8px';
      opp.element.style.backgroundColor = 'rgba(0, 120, 212, 0.1)';

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.textContent = `${opp.icon} +${opp.pointsAvailable} points`;
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = '#0078d4';
      tooltip.style.color = 'white';
      tooltip.style.padding = '4px 8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.fontWeight = 'bold';
      tooltip.style.zIndex = '10000';
      tooltip.style.marginTop = '-25px';

      opp.element.parentElement.style.position = 'relative';
      opp.element.parentElement.insertBefore(tooltip, opp.element);
    }
  });
}

// Start monitoring when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startMonitoring();
    highlightOpportunities();
  });
} else {
  startMonitoring();
  highlightOpportunities();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_OPPORTUNITIES') {
    const opportunities = detectOpportunities();
    sendResponse({ opportunities });
  } else if (request.type === 'HIGHLIGHT_OPPORTUNITIES') {
    highlightOpportunities();
    sendResponse({ success: true });
  }
});
