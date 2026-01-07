/**
 * Clan System for TheFortz
 * Create and manage clans with members, ranks, and perks
 */

const ClanSystem = {
  // All clans
  clans: {},

  // Clan ranks
  ranks: {
    LEADER: {
      name: 'Leader',
      level: 4,
      permissions: ['invite', 'kick', 'promote', 'demote', 'edit', 'disband']
    },
    OFFICER: {
      name: 'Officer',
      level: 3,
      permissions: ['invite', 'kick', 'edit']
    },
    VETERAN: {
      name: 'Veteran',
      level: 2,
      permissions: ['invite']
    },
    MEMBER: {
      name: 'Member',
      level: 1,
      permissions: []
    }
  },

  // Clan perks (unlocked by clan level)
  perks: {
    XP_BOOST_1: {
      id: 'xp_boost_1',
      name: 'XP Boost I',
      description: '+5% XP for all members',
      requiredLevel: 2,
      effect: { xpBonus: 0.05 }
    },
    XP_BOOST_2: {
      id: 'xp_boost_2',
      name: 'XP Boost II',
      description: '+10% XP for all members',
      requiredLevel: 5,
      effect: { xpBonus: 0.10 }
    },
    FORTZ_BOOST_1: {
      id: 'fortz_boost_1',
      name: 'Wealth I',
      description: '+5% Fortz for all members',
      requiredLevel: 3,
      effect: { fortzBonus: 0.05 }
    },
    FORTZ_BOOST_2: {
      id: 'fortz_boost_2',
      name: 'Wealth II',
      description: '+10% Fortz for all members',
      requiredLevel: 6,
      effect: { fortzBonus: 0.10 }
    },
    DAMAGE_BOOST: {
      id: 'damage_boost',
      name: 'United Front',
      description: '+3% damage when playing with clan members',
      requiredLevel: 4,
      effect: { damageBonus: 0.03 }
    },
    HEALTH_BOOST: {
      id: 'health_boost',
      name: 'Fortified',
      description: '+10 max health for all members',
      requiredLevel: 4,
      effect: { healthBonus: 10 }
    },
    SPAWN_PROTECTION: {
      id: 'spawn_protection',
      name: 'Safe Haven',
      description: '3 seconds of spawn protection',
      requiredLevel: 7,
      effect: { spawnProtection: 3 }
    },
    RESPAWN_SPEED: {
      id: 'respawn_speed',
      name: 'Quick Return',
      description: '-20% respawn time',
      requiredLevel: 8,
      effect: { respawnSpeed: -0.20 }
    }
  },

  // Create clan
  createClan(leaderId, leaderName, clanData) {
    const clanId = `clan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate clan tag (2-4 characters)
    if (!clanData.tag || clanData.tag.length < 2 || clanData.tag.length > 4) {
      return { success: false, error: 'Tag must be 2-4 characters' };
    }

    // Check if tag is taken
    const tagExists = Object.values(this.clans).some((c) => c.tag === clanData.tag);
    if (tagExists) {
      return { success: false, error: 'Tag already taken' };
    }

    const clan = {
      id: clanId,
      name: clanData.name,
      tag: clanData.tag,
      description: clanData.description || '',
      color: clanData.color || '#FFD700',
      emblem: clanData.emblem || '🛡️',
      createdAt: Date.now(),
      level: 1,
      xp: 0,
      members: {
        [leaderId]: {
          playerId: leaderId,
          playerName: leaderName,
          rank: 'LEADER',
          joinedAt: Date.now(),
          contribution: 0
        }
      },
      maxMembers: 50,
      settings: {
        joinType: 'invite_only', // invite_only, request, open
        minLevel: 1
      },
      stats: {
        totalKills: 0,
        totalWins: 0,
        matchesPlayed: 0
      },
      activePerks: []
    };

    this.clans[clanId] = clan;

    return {
      success: true,
      clan: clan
    };
  },

  // Invite player to clan
  invitePlayer(clanId, inviterId, inviteeId, inviteeName) {
    const clan = this.clans[clanId];
    if (!clan) {
      return { success: false, error: 'Clan not found' };
    }

    // Check permissions
    if (!this.hasPermission(clan, inviterId, 'invite')) {
      return { success: false, error: 'No permission' };
    }

    // Check if clan is full
    if (Object.keys(clan.members).length >= clan.maxMembers) {
      return { success: false, error: 'Clan is full' };
    }

    // Check if already a member
    if (clan.members[inviteeId]) {
      return { success: false, error: 'Already a member' };
    }

    return {
      success: true,
      invite: {
        clanId: clanId,
        clanName: clan.name,
        clanTag: clan.tag,
        inviterId: inviterId,
        inviteeId: inviteeId,
        inviteeName: inviteeName,
        timestamp: Date.now()
      }
    };
  },

  // Accept invite
  acceptInvite(clanId, playerId, playerName) {
    const clan = this.clans[clanId];
    if (!clan) {
      return { success: false, error: 'Clan not found' };
    }

    // Check if clan is full
    if (Object.keys(clan.members).length >= clan.maxMembers) {
      return { success: false, error: 'Clan is full' };
    }

    // Add member
    clan.members[playerId] = {
      playerId: playerId,
      playerName: playerName,
      rank: 'MEMBER',
      joinedAt: Date.now(),
      contribution: 0
    };

    return {
      success: true,
      clan: clan
    };
  },

  // Leave clan
  leaveClan(clanId, playerId) {
    const clan = this.clans[clanId];
    if (!clan) {
      return { success: false, error: 'Clan not found' };
    }

    const member = clan.members[playerId];
    if (!member) {
      return { success: false, error: 'Not a member' };
    }

    // Can't leave if leader (must transfer or disband)
    if (member.rank === 'LEADER') {
      return { success: false, error: 'Leader must transfer leadership or disband clan' };
    }

    delete clan.members[playerId];

    return { success: true };
  },

  // Kick member
  kickMember(clanId, kickerId, targetId) {
    const clan = this.clans[clanId];
    if (!clan) {
      return { success: false, error: 'Clan not found' };
    }

    // Check permissions
    if (!this.hasPermission(clan, kickerId, 'kick')) {
      return { success: false, error: 'No permission' };
    }

    const target = clan.members[targetId];
    if (!target) {
      return { success: false, error: 'Member not found' };
    }

    // Can't kick leader
    if (target.rank === 'LEADER') {
      return { success: false, error: 'Cannot kick leader' };
    }

    // Can't kick higher or equal rank
    const kickerRank = this.ranks[clan.members[kickerId].rank].level;
    const targetRank = this.ranks[target.rank].level;
    if (targetRank >= kickerRank) {
      return { success: false, error: 'Cannot kick equal or higher rank' };
    }

    delete clan.members[targetId];

    return { success: true };
  },

  // Promote member
  promoteMember(clanId, promoterId, targetId) {
    const clan = this.clans[clanId];
    if (!clan) {
      return { success: false, error: 'Clan not found' };
    }

    // Check permissions
    if (!this.hasPermission(clan, promoterId, 'promote')) {
      return { success: false, error: 'No permission' };
    }

    const target = clan.members[targetId];
    if (!target) {
      return { success: false, error: 'Member not found' };
    }

    // Get next rank
    const rankOrder = ['MEMBER', 'VETERAN', 'OFFICER', 'LEADER'];
    const currentIndex = rankOrder.indexOf(target.rank);
    if (currentIndex >= rankOrder.length - 1) {
      return { success: false, error: 'Already max rank' };
    }

    target.rank = rankOrder[currentIndex + 1];

    return {
      success: true,
      newRank: target.rank
    };
  },

  // Add XP to clan
  addClanXP(clanId, amount) {
    const clan = this.clans[clanId];
    if (!clan) return;

    clan.xp += amount;

    // Check for level up
    const xpNeeded = this.getXPForLevel(clan.level + 1);
    if (clan.xp >= xpNeeded) {
      clan.level++;
      clan.xp -= xpNeeded;

      // Unlock new perks
      this.updateClanPerks(clan);

      return {
        leveledUp: true,
        newLevel: clan.level
      };
    }

    return { leveledUp: false };
  },

  // Get XP needed for level
  getXPForLevel(level) {
    return Math.floor(1000 * Math.pow(1.5, level - 1));
  },

  // Update clan perks
  updateClanPerks(clan) {
    clan.activePerks = [];

    Object.values(this.perks).forEach((perk) => {
      if (clan.level >= perk.requiredLevel) {
        clan.activePerks.push(perk.id);
      }
    });
  },

  // Get clan perks
  getClanPerks(clanId) {
    const clan = this.clans[clanId];
    if (!clan) return [];

    const effects = {};

    clan.activePerks.forEach((perkId) => {
      const perk = this.perks[perkId.toUpperCase()];
      if (perk) {
        Object.assign(effects, perk.effect);
      }
    });

    return effects;
  },

  // Check permission
  hasPermission(clan, playerId, permission) {
    const member = clan.members[playerId];
    if (!member) return false;

    const rank = this.ranks[member.rank];
    return rank.permissions.includes(permission);
  },

  // Get clan info
  getClan(clanId) {
    return this.clans[clanId];
  },

  // Get player's clan
  getPlayerClan(playerId) {
    return Object.values(this.clans).find((clan) =>
    clan.members[playerId] !== undefined
    );
  },

  // Search clans
  searchClans(query) {
    return Object.values(this.clans).filter((clan) =>
    clan.name.toLowerCase().includes(query.toLowerCase()) ||
    clan.tag.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get clan leaderboard
  getClanLeaderboard(limit = 100) {
    return Object.values(this.clans).
    sort((a, b) => b.level - a.level || b.xp - a.xp).
    slice(0, limit);
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ClanSystem = ClanSystem;
}