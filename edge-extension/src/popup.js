(function () {
  'use strict';

  let currentMode = 'desktop';
  let state = {};

  // DOM Elements
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const pointsCounter = document.getElementById('pointsCounter');
  const searchCounter = document.getElementById('searchCounter');
  const startAutoBtn = document.getElementById('startAutoBtn');
  const startManualBtn = document.getElementById('startManualBtn');
  const stopBtn = document.getElementById('stopBtn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  // Initialize
  function init() {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
      if (response) {
        state = response;
        updateUI();
      }
    });
  }

  // Update UI based on state
  function updateUI() {
    const maxSearches = state.tier === 'gold' ? 12 : 6;
    const count = state.searchCount[currentMode] || 0;
    const points = state.pointsEarned[currentMode] || 0;

    pointsCounter.textContent = points;
    searchCounter.textContent = `${count}/${maxSearches}`;

    if (state.isSearching) {
      statusBadge.textContent = 'Searching...';
      statusBadge.classList.add('searching');
      statusText.textContent = `${currentMode.toUpperCase()}: ${count}/${maxSearches} searches`;
      startAutoBtn.style.display = 'none';
      startManualBtn.style.display = 'none';
      stopBtn.style.display = 'block';
    } else {
      statusBadge.textContent = 'Idle';
      statusBadge.classList.remove('searching');
      statusText.textContent = 'Ready to start searching';
      startAutoBtn.style.display = 'block';
      startManualBtn.style.display = 'block';
      stopBtn.style.display = 'none';
    }
  }

  // Event Listeners
  startAutoBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'startAutomatic', mode: currentMode }, () => {
      setTimeout(init, 500);
    });
  });

  startManualBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'startManual', mode: currentMode }, () => {
      setTimeout(init, 500);
    });
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'stop' }, () => {
      setTimeout(init, 500);
    });
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      chrome.runtime.sendMessage({ type: 'setMode', mode: currentMode }, () => {
        updateUI();
      });
    });
  });

  // Listen for state updates from service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'stateUpdate') {
      state = request.data;
      updateUI();
    }
  });

  // Initial load
  init();
})();
