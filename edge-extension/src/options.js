(function () {
  'use strict';

  // DOM Elements
  const tierRadios = document.querySelectorAll('input[name="tier"]');
  const minIntervalInput = document.getElementById('minInterval');
  const maxIntervalInput = document.getElementById('maxInterval');
  const userAgentRotationCheckbox = document.getElementById('enableUserAgentRotation');
  const localizedSearchCheckbox = document.getElementById('enableLocalizedSearch');
  const strictCooldownCheckbox = document.getElementById('strictCooldown');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Load settings
  function loadSettings() {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      
      if (settings.tier) {
        document.querySelector(`input[name="tier"][value="${settings.tier}"]`).checked = true;
      }
      
      if (settings.minInterval) minIntervalInput.value = settings.minInterval;
      if (settings.maxInterval) maxIntervalInput.value = settings.maxInterval;
      
      userAgentRotationCheckbox.checked = settings.enableUserAgentRotation !== false;
      localizedSearchCheckbox.checked = settings.enableLocalizedSearch !== false;
      strictCooldownCheckbox.checked = settings.strictCooldown === true;
    });
  }

  // Save settings
  function saveSettings() {
    const settings = {
      tier: document.querySelector('input[name="tier"]:checked').value,
      minInterval: parseInt(minIntervalInput.value),
      maxInterval: parseInt(maxIntervalInput.value),
      enableUserAgentRotation: userAgentRotationCheckbox.checked,
      enableLocalizedSearch: localizedSearchCheckbox.checked,
      strictCooldown: strictCooldownCheckbox.checked,
    };

    chrome.storage.local.set({ settings }, () => {
      alert('Settings saved successfully!');
    });
  }

  // Reset to defaults
  function resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
      chrome.storage.local.remove(['settings'], () => {
        loadSettings();
        alert('Settings reset to defaults!');
      });
    }
  }

  // Event listeners
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);

  // Initial load
  loadSettings();
})();
