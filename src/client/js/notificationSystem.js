/**
 * Notification System for TheFortz
 * In-game notifications, toasts, and alerts
 */

const NotificationSystem = {
  // Active notifications
  notifications: [],

  // Notification queue
  queue: [],

  // Settings
  settings: {
    maxVisible: 5,
    defaultDuration: 5000,
    stackNotifications: true,
    soundEnabled: true
  },

  // Notification types
  types: {
    INFO: {
      icon: 'ℹ️',
      color: '#4A90E2',
      sound: 'notification'
    },
    SUCCESS: {
      icon: '✅',
      color: '#4CAF50',
      sound: 'success'
    },
    WARNING: {
      icon: '⚠️',
      color: '#FF9800',
      sound: 'warning'
    },
    ERROR: {
      icon: '❌',
      color: '#F44336',
      sound: 'error'
    },
    ACHIEVEMENT: {
      icon: '🏆',
      color: '#FFD700',
      sound: 'achievement'
    },
    LEVEL_UP: {
      icon: '⭐',
      color: '#9C27B0',
      sound: 'levelup'
    },
    KILL: {
      icon: '💀',
      color: '#FF5252',
      sound: 'kill'
    },
    REWARD: {
      icon: '🎁',
      color: '#00BCD4',
      sound: 'reward'
    }
  },

  // Show notification
  show(message, type = 'INFO', options = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: message,
      type: type,
      icon: options.icon || this.types[type].icon,
      color: options.color || this.types[type].color,
      duration: options.duration || this.settings.defaultDuration,
      createdAt: Date.now(),
      progress: 0,
      dismissed: false,
      action: options.action || null,
      data: options.data || {}
    };

    // Add to queue
    this.queue.push(notification);

    // Process queue
    this.processQueue();

    // Play sound
    if (this.settings.soundEnabled && AdvancedSound) {
      const soundName = this.types[type].sound;
      AdvancedSound.playSound(soundName);
    }

    return notification.id;
  },

  // Process notification queue
  processQueue() {
    while (this.queue.length > 0 && this.notifications.length < this.settings.maxVisible) {
      const notification = this.queue.shift();
      this.notifications.push(notification);
    }
  },

  // Update notifications
  update(deltaTime) {
    const now = Date.now();

    this.notifications = this.notifications.filter((notif) => {
      if (notif.dismissed) return false;

      const elapsed = now - notif.createdAt;
      notif.progress = elapsed / notif.duration;

      if (elapsed >= notif.duration) {
        return false;
      }

      return true;
    });

    // Process queue if space available
    if (this.notifications.length < this.settings.maxVisible) {
      this.processQueue();
    }
  },

  // Dismiss notification
  dismiss(notificationId) {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.dismissed = true;
    }
  },

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.queue = [];
  },

  // Render notifications
  render(ctx, canvas) {
    const x = canvas.width - 320;
    let y = 20;
    const width = 300;
    const height = 80;
    const spacing = 10;

    this.notifications.forEach((notif, index) => {
      const notifY = y + (height + spacing) * index;

      // Slide in animation
      const slideProgress = Math.min(1, (Date.now() - notif.createdAt) / 300);
      const slideX = x + (1 - slideProgress) * 320;

      // Fade out animation
      const fadeProgress = notif.progress > 0.8 ? (notif.progress - 0.8) / 0.2 : 0;
      const alpha = 1 - fadeProgress;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(slideX, notifY, width, height);

      // Colored border
      ctx.strokeStyle = notif.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(slideX, notifY, width, height);

      // Icon
      ctx.font = '32px Arial';
      ctx.fillText(notif.icon, slideX + 15, notifY + 45);

      // Message
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';

      // Word wrap
      const maxWidth = width - 70;
      const words = notif.message.split(' ');
      let line = '';
      let lineY = notifY + 25;

      words.forEach((word) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, slideX + 60, lineY);
          line = word + ' ';
          lineY += 18;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, slideX + 60, lineY);

      // Progress bar
      ctx.fillStyle = notif.color;
      ctx.globalAlpha = 0.3 * alpha;
      ctx.fillRect(slideX, notifY + height - 4, width * notif.progress, 4);

      ctx.restore();
    });
  },

  // Preset notifications
  showAchievement(achievementName, reward) {
    this.show(
      `Achievement Unlocked: ${achievementName}`,
      'ACHIEVEMENT',
      {
        duration: 7000,
        data: { reward }
      }
    );
  },

  showLevelUp(newLevel) {
    this.show(
      `Level Up! You are now level ${newLevel}`,
      'LEVEL_UP',
      {
        duration: 5000,
        data: { level: newLevel }
      }
    );
  },

  showKill(victimName, weaponUsed) {
    this.show(
      `You eliminated ${victimName}`,
      'KILL',
      {
        duration: 3000,
        data: { victim: victimName, weapon: weaponUsed }
      }
    );
  },

  showReward(rewardType, amount) {
    this.show(
      `+${amount} ${rewardType}`,
      'REWARD',
      {
        duration: 4000,
        data: { type: rewardType, amount }
      }
    );
  },

  showQuestComplete(questName, rewards) {
    this.show(
      `Quest Complete: ${questName}`,
      'SUCCESS',
      {
        duration: 6000,
        data: { quest: questName, rewards }
      }
    );
  },

  showError(errorMessage) {
    this.show(errorMessage, 'ERROR', { duration: 5000 });
  },

  showInfo(infoMessage) {
    this.show(infoMessage, 'INFO', { duration: 4000 });
  },

  showWarning(warningMessage) {
    this.show(warningMessage, 'WARNING', { duration: 5000 });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.NotificationSystem = NotificationSystem;
}