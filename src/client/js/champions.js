// Champions Screen JavaScript
class ChampionsManager {
  constructor() {
    this.activeTab = 'creator';
    this.selectedPlayer = null;
    this.activeCategory = 'eliminations';
    
    // Mock data for each tab
    this.data = {
      creator: [
        { rank: 1, name: 'ShadowBuilder', score: 15420, avatar: '🎨' },
        { rank: 2, name: 'MapMaster_X', score: 14850, avatar: '🏗️' },
        { rank: 3, name: 'DesignGuru', score: 13990, avatar: '✨' },
        { rank: 4, name: 'LevelCraft', score: 12780, avatar: '🎯' },
        { rank: 5, name: 'WorldForge', score: 11540, avatar: '🌍' },
      ],
      player: [
        { rank: 1, name: 'ProGamer_99', score: 28450, avatar: '⚔️' },
        { rank: 2, name: 'EliteSniper', score: 26320, avatar: '🎮' },
        { rank: 3, name: 'NinjaKing', score: 24890, avatar: '🥷' },
        { rank: 4, name: 'ChampionX', score: 23100, avatar: '👑' },
        { rank: 5, name: 'VictoryLord', score: 21870, avatar: '🔥' },
      ],
      fortz: [
        { rank: 1, name: 'FortressKing', score: 19850, avatar: '🏰' },
        { rank: 2, name: 'DefenseGod', score: 18420, avatar: '🛡️' },
        { rank: 3, name: 'TowerMaster', score: 17650, avatar: '🗼' },
        { rank: 4, name: 'WallBuilder', score: 16230, avatar: '🧱' },
        { rank: 5, name: 'FortNinja', score: 15900, avatar: '⚡' },
      ],
      prime: [
        { rank: 1, name: 'PrimeLegend', score: 35200, avatar: '💎' },
        { rank: 2, name: 'EliteChampion', score: 32890, avatar: '🌟' },
        { rank: 3, name: 'UltimateHero', score: 30450, avatar: '👾' },
        { rank: 4, name: 'SuperStar_Pro', score: 28760, avatar: '✨' },
        { rank: 5, name: 'MegaPlayer', score: 27340, avatar: '🚀' },
      ]
    };
    
    this.init();
  }
  
  init() {
    this.renderLeaderboard();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.champions-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabType = e.currentTarget.dataset.tab;
        this.switchTab(tabType);
      });
    });
    
    // Stats category switching
    document.querySelectorAll('.stats-category').forEach(category => {
      category.addEventListener('click', (e) => {
        const categoryType = e.currentTarget.dataset.category;
        this.switchStatsCategory(categoryType);
      });
    });
    
    // Close profile modal
    const profileModal = document.getElementById('playerProfileModal');
    const backdrop = profileModal?.querySelector('.profile-backdrop');
    const closeBtn = profileModal?.querySelector('.profile-close-btn');
    
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closePlayerProfile());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePlayerProfile());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.selectedPlayer) {
        this.closePlayerProfile();
      }
    });
  }
  
  switchTab(tabType) {
    this.activeTab = tabType;
    
    // Update tab buttons
    document.querySelectorAll('.champions-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    
    // Render new leaderboard
    this.renderLeaderboard();
  }
  
  renderLeaderboard() {
    const leaderboard = document.getElementById('championsLeaderboard');
    const currentData = this.data[this.activeTab];
    
    if (!leaderboard || !currentData) return;
    
    leaderboard.innerHTML = currentData.map((entry, index) => `
      <div class="leaderboard-entry ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}" 
           data-player='${JSON.stringify(entry)}'
           style="animation-delay: ${index * 0.1}s">
        <div class="entry-rank ${entry.rank === 1 ? 'rank-1' : ''}">
          ${entry.rank === 1 ? '<i class="fas fa-crown"></i>' : `#${entry.rank}`}
        </div>
        <div class="entry-name ${entry.rank <= 3 ? 'top-3' : ''}">
          <h3>${entry.name}</h3>
          ${entry.rank <= 3 ? '<div class="entry-award">Award: 1000 Fortz a day</div>' : ''}
        </div>
        <div class="entry-score">
          <div class="score-value">${entry.score.toLocaleString()}</div>
          <div class="score-label">points</div>
        </div>
      </div>
    `).join('');
    
    // Add click listeners to entries
    leaderboard.querySelectorAll('.leaderboard-entry').forEach(entry => {
      entry.addEventListener('click', () => {
        const playerData = JSON.parse(entry.dataset.player);
        this.showPlayerProfile(playerData);
      });
    });
  }
  
  showPlayerProfile(player) {
    this.selectedPlayer = player;
    
    const modal = document.getElementById('playerProfileModal');
    const profileRank = document.getElementById('profileRank');
    const profileName = document.getElementById('profileName');
    const profileScore = document.getElementById('profileScore');
    
    if (!modal) return;
    
    // Update profile info
    if (profileRank) {
      profileRank.innerHTML = player.rank === 1 ? 
        '<i class="fas fa-crown"></i>' : 
        `<span style="font-size: 2rem; color: white;">#${player.rank}</span>`;
    }
    
    if (profileName) {
      profileName.textContent = player.name;
    }
    
    if (profileScore) {
      profileScore.textContent = player.score.toLocaleString();
    }
    
    // Reset to first category
    this.activeCategory = 'eliminations';
    this.updateStatsDisplay();
    this.updateStatsCategoryButtons();
    
    // Show modal
    modal.classList.remove('hidden');
  }
  
  closePlayerProfile() {
    this.selectedPlayer = null;
    const modal = document.getElementById('playerProfileModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
  
  switchStatsCategory(category) {
    this.activeCategory = category;
    this.updateStatsDisplay();
    this.updateStatsCategoryButtons();
  }
  
  updateStatsCategoryButtons() {
    document.querySelectorAll('.stats-category').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${this.activeCategory}"]`)?.classList.add('active');
  }
  
  updateStatsDisplay() {
    const statsDisplay = document.getElementById('statsDisplay');
    if (!statsDisplay || !this.selectedPlayer) return;
    
    const stats = this.getCategoryStats();
    
    statsDisplay.innerHTML = stats.map(stat => `
      <div class="stat-item">
        <span class="stat-title">${stat.title}</span>
        <span class="stat-value">${stat.value}</span>
      </div>
    `).join('');
  }
  
  getCategoryStats() {
    if (!this.selectedPlayer) return [];
    
    switch (this.activeCategory) {
      case 'eliminations':
        return [
          { title: 'Total Eliminations', value: '850+' },
          { title: 'Headshots', value: '350' },
          { title: 'Melee Kills', value: '125' },
        ];
      case 'battletime':
        return [
          { title: 'Battle Time', value: '245h+' },
          { title: 'Played Map', value: '87' },
          { title: 'Online p/day', value: '3.5h avg' },
        ];
      case 'glory':
        return [
          { title: 'Victories', value: '72 Wins' },
          { title: 'Win Rate', value: '45%' },
          { title: 'Top 3 Finishes', value: '156' },
        ];
      default:
        return [];
    }
  }
}

// Global functions for compatibility with existing code
function switchChampionsTab(tabType) {
  if (window.championsManager) {
    window.championsManager.switchTab(tabType);
  }
}

function switchStatsCategory(category) {
  if (window.championsManager) {
    window.championsManager.switchStatsCategory(category);
  }
}

function closePlayerProfile() {
  if (window.championsManager) {
    window.championsManager.closePlayerProfile();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on a page with the champions screen
  if (document.getElementById('championsScreen')) {
    window.championsManager = new ChampionsManager();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChampionsManager;
}