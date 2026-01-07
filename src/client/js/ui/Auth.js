// Browser-compatible auth module
let currentUser = null;
let authToken = localStorage.getItem('authToken');

function showAuthError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

async function handleSignup() {
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
  const errorDiv = document.getElementById('signupError');

  // Clear previous errors
  errorDiv.classList.add('hidden');

  // Validation
  if (!username || !password || !passwordConfirm) {
    showAuthError('signupError', 'Please fill in all fields');
    return;
  }

  if (username.length < 3 || username.length > 20) {
    showAuthError('signupError', 'Username must be 3-20 characters');
    return;
  }

  if (password.length < 4) {
    showAuthError('signupError', 'Password must be at least 4 characters');
    return;
  }

  if (password !== passwordConfirm) {
    showAuthError('signupError', 'Passwords do not match');
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    currentUser = data.user;

    closeSignupModal();
    updateAuthUI();
  } catch (error) {
    showAuthError('signupError', error.message);
  }
}

async function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  // Clear previous errors
  errorDiv.classList.add('hidden');

  if (!username || !password) {
    showAuthError('loginError', 'Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    currentUser = data.user;

    closeLoginModal();
    updateAuthUI();
  } catch (error) {
    showAuthError('loginError', error.message);
  }
}




















async function checkAuth() {
  // Check for CrazyGames user first (priority)
  if (window.CrazyGamesIntegration && window.CrazyGamesIntegration.isInitialized) {
    try {
      const cgUser = await window.CrazyGamesIntegration.loadUserData();
      if (cgUser && cgUser.username) {
        // Set up current user with CrazyGames data
        currentUser = {
          username: cgUser.username,
          profilePictureUrl: cgUser.profilePictureUrl,
          userId: cgUser.userId,
          isCrazyGamesUser: true,
          fortzCurrency: 0,
          ownedItems: { colors: ['blue'], bodies: ['body_halftrack'], weapons: ['turret_01_mk1'] },
          selectedTank: { color: 'blue', body: 'body_halftrack', weapon: 'turret_01_mk1' }
        };

        // Try to load saved data from CrazyGames cloud
        const savedData = await window.CrazyGamesIntegration.loadGameData();
        if (savedData) {
          currentUser.fortzCurrency = savedData.fortzCurrency || 0;
          currentUser.ownedItems = savedData.ownedItems || currentUser.ownedItems;
          currentUser.selectedTank = savedData.selectedTank || currentUser.selectedTank;
        }

        updateAuthUI();
        console.log('✓ CrazyGames user logged in:', cgUser.username);
        return;
      }
    } catch (error) {
      console.error('CrazyGames user check failed:', error);
    }
  }

  // Fall back to local auth system
  if (!authToken) {
    updateAuthUI();
    return;
  }

  try {
    const response = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error('Invalid session');
    }

    const data = await response.json();
    currentUser = data.user;
    updateAuthUI();
  } catch (error) {
    console.error('Auth check failed:', error);
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
  }
}

function updateAuthUI() {
  const authButtons = document.getElementById('authButtons');
  const userInfo = document.getElementById('userInfo');

  if (currentUser) {
    authButtons.classList.add('hidden');
    userInfo.classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.username;

    // Update level progress display
    if (typeof updateLevelProgressImage === 'function') {
      updateLevelProgressImage(currentUser.level || 1, currentUser.xp || 0, currentUser.xpToNext || 100);
    }

    // Start vehicle hexagon rendering (continuous for GIF animation)
    if (typeof startVehicleHexagonRendering === 'function') {
      setTimeout(startVehicleHexagonRendering, 100);
    }

    // Sync user data to gameState
    if (window.gameState) {
      window.gameState.fortzCurrency = currentUser.fortzCurrency || 0;
      window.gameState.ownedItems = currentUser.ownedItems || {
        colors: ['blue'],
        bodies: ['body_halftrack'],
        weapons: ['turret_01_mk1']
      };
      window.gameState.selectedTank = currentUser.selectedTank || {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
      };

      // Update UI displays
      if (typeof updateFortzDisplay === 'function') {
        updateFortzDisplay();
      }
      if (typeof updateLobbyTankPreview === 'function') {
        updateLobbyTankPreview();
      }
    }

    // Add click handler to show stats
    userInfo.onclick = toggleStatsBox;

    // Update stats if available
    updateStatsDisplay();
  } else {
    authButtons.classList.remove('hidden');
    userInfo.classList.add('hidden');

    // Remove click handler
    userInfo.onclick = null;
  }
}











function toggleStatsBox() {
  const statsBox = document.getElementById('statsBox');
  if (statsBox) {
    if (statsBox.classList.contains('hidden')) {
      statsBox.classList.remove('hidden');
      // Update stats when showing
      updateStatsDisplay();
    } else {
      statsBox.classList.add('hidden');
    }
  }
}

function closeStatsBox() {
  const statsBox = document.getElementById('statsBox');
  if (statsBox) {
    statsBox.classList.add('hidden');
  }
}

function updateStatsDisplay() {
  if (!currentUser) return;

  const stats = currentUser.stats || {
    gamesPlayed: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalScore: 0,
    highestStreak: 0,
    timePlayed: 0
  };

  document.getElementById('gamesPlayed').textContent = stats.gamesPlayed || 0;
  document.getElementById('totalKills').textContent = stats.totalKills || 0;
  document.getElementById('totalDeaths').textContent = stats.totalDeaths || 0;

  const kdRatio = stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toFixed(2);
  document.getElementById('kdRatio').textContent = kdRatio;

  document.getElementById('totalScore').textContent = stats.totalScore || 0;
  document.getElementById('highestStreak').textContent = stats.highestStreak || 0;

  const hours = Math.floor((stats.timePlayed || 0) / 3600);
  const minutes = Math.floor((stats.timePlayed || 0) % 3600 / 60);
  document.getElementById('timePlayed').textContent = `${hours}h ${minutes}m`;
}

// Make functions globally accessible
window.toggleStatsBox = toggleStatsBox;
window.closeStatsBox = closeStatsBox;
window.updateStatsDisplay = updateStatsDisplay;

function openLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').classList.add('hidden');
}

function openSignupModal() {
  document.getElementById('signupModal').classList.remove('hidden');
}

function closeSignupModal() {
  document.getElementById('signupModal').classList.add('hidden');
  document.getElementById('signupUsername').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupPasswordConfirm').value = '';
  document.getElementById('signupError').classList.add('hidden');
}

function switchToSignup() {
  closeLoginModal();
  openSignupModal();
}

function switchToLogin() {
  closeSignupModal();
  openLoginModal();
}

// Friends modal functions
window.openFriendsModal = function () {
  const modal = document.getElementById('friendsModal');
  if (modal) {
    modal.classList.remove('hidden');
    // Load friends list
    if (typeof window.loadFriendsList === 'function') {
      window.loadFriendsList();
    }
  }
};

function closeFriendsModal() {
  const modal = document.getElementById('friendsModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}
window.closeFriendsModal = closeFriendsModal;

// Friend search functionality
window.searchUsers = function () {
  const searchInput = document.getElementById('friendSearch');
  const resultsDiv = document.getElementById('searchResults');

  if (!searchInput || !resultsDiv) return;

  const query = searchInput.value.trim();

  if (query.length < 2) {
    resultsDiv.classList.add('hidden');
    return;
  }

  // TODO: Implement actual user search via backend
  // For now, show placeholder
  resultsDiv.innerHTML = `
        <div class="search-result-item">
            <div>
                <div class="search-result-name">${query}</div>
                <div class="search-result-level">Search functionality coming soon!</div>
            </div>
        </div>
    `;
  resultsDiv.classList.remove('hidden');
};

window.switchFriendsTab = function (tab) {
  const friendsTab = document.querySelector('[data-tab="friends"]');
  const requestsTab = document.querySelector('[data-tab="requests"]');
  const friendsContent = document.getElementById('friendsTabContent');
  const requestsContent = document.getElementById('requestsTabContent');

  if (tab === 'friends') {
    friendsTab.classList.add('active');
    requestsTab.classList.remove('active');
    friendsContent.classList.remove('hidden');
    requestsContent.classList.add('hidden');
  } else {
    friendsTab.classList.remove('active');
    requestsTab.classList.add('active');
    friendsContent.classList.add('hidden');
    requestsContent.classList.remove('hidden');
  }
};

window.loadFriendsList = function () {
  const friendsList = document.getElementById('friendsList');
  const requestsList = document.getElementById('requestsList');

  if (friendsList) {
    friendsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Friends list coming soon!</div>';
  }

  if (requestsList) {
    requestsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">No pending requests</div>';
  }
};


// Make functions globally accessible
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;

// Logout function
function logout() {
  console.log('Logging out user...');
  
  try {
    // Clear auth token
    authToken = null;
    localStorage.removeItem('authToken');
    
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Clear any other auth-related data
    localStorage.removeItem('userStats');
    localStorage.removeItem('userPreferences');
    
    // Update UI to show logged out state
    updateAuthUI();
    
    // Show notification
    if (typeof window.showNotification === 'function') {
      window.showNotification('Successfully logged out', 'info');
    }
    
    console.log('✅ User logged out successfully');
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error during logout', 'error');
    }
  }
}

window.logout = logout;


// Check auth on page load
window.addEventListener('DOMContentLoaded', checkAuth);

// Export auth functions for module usage
export {
  handleLogin,
  handleSignup,
  logout,
  checkAuth,
  updateAuthUI,
  openLoginModal,
  closeLoginModal,
  openSignupModal,
  closeSignupModal,
  switchToSignup,
  switchToLogin };


export { currentUser, authToken };