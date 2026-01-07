























function updateVolume(type, value) {
  const val = parseInt(value);
  if (window.gameState && window.gameState.settings) {
    window.gameState.settings.sound[type] = val;

    // Update display text
    const display = document.getElementById(`${type}VolumeValue`);
    if (display) display.textContent = val + '%';

    // Save settings
    saveSettings();
  }
}

function setGraphicsQuality(quality) {
  if (window.gameState && window.gameState.settings) {
    window.gameState.settings.graphics.quality = quality;
    setGraphicsQualityUI(quality);
    saveSettings();
    console.log(`Graphics quality set to ${quality}`);
  }
}

function setGraphicsQualityUI(quality) {
  // Update button states
  const qualities = ['low', 'medium', 'high', 'ultra'];
  qualities.forEach((q) => {
    const btn = document.getElementById(`graphics${q.charAt(0).toUpperCase() + q.slice(1)}`);
    if (btn) {
      if (q === quality) {
        btn.classList.add('active');
        btn.style.background = 'rgba(0, 247, 255, 0.3)';
        btn.style.borderColor = '#00f7ff';
        btn.style.color = '#00f7ff';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
        btn.style.borderColor = '#666';
        btn.style.color = '#aaa';
      }
    }
  });
}

function saveSettings() {
  if (typeof localStorage !== 'undefined' && window.gameState) {
    localStorage.setItem('gameSettings', JSON.stringify(window.gameState.settings));
  }
}

// Initialize settings UI
function initSettingsUI() {
  console.log('Initializing settings UI...');
  
  // Initialize volume sliders if they exist
  const masterVolumeSlider = document.getElementById('masterVolume');
  const musicVolumeSlider = document.getElementById('musicVolume');
  const sfxVolumeSlider = document.getElementById('sfxVolume');
  
  if (masterVolumeSlider && window.gameState?.settings?.audio) {
    masterVolumeSlider.value = window.gameState.settings.audio.masterVolume;
  }
  
  if (musicVolumeSlider && window.gameState?.settings?.audio) {
    musicVolumeSlider.value = window.gameState.settings.audio.musicVolume;
  }
  
  if (sfxVolumeSlider && window.gameState?.settings?.audio) {
    sfxVolumeSlider.value = window.gameState.settings.audio.sfxVolume;
  }
  
  // Initialize graphics quality buttons
  if (window.gameState?.settings?.graphics?.quality) {
    setGraphicsQualityUI(window.gameState.settings.graphics.quality);
  }
  
  console.log('✅ Settings UI initialized');
}

// Export functions to global scope
window.initSettingsUI = initSettingsUI;
window.updateVolume = updateVolume;
window.setGraphicsQuality = setGraphicsQuality;