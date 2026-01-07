// Enhanced Sound System - Immersive Audio for Tank Combat
// Engine sounds, weapon sounds, impact sounds, ambient audio

const EnhancedSoundSystem = {
  // Audio context
  audioContext: null,
  sounds: new Map(),

  // Volume settings
  volumes: {
    master: 0.75,
    effects: 0.75,
    music: 0.5,
    ambient: 0.3
  },

  // Sound pools for performance
  soundPools: new Map(),

  // Currently playing sounds
  playing: new Set(),

  // Initialize audio system
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('✅ Enhanced Sound System initialized');
      return true;
    } catch (e) {
      console.warn('⚠️ Web Audio API not supported');
      return false;
    }
  },

  // Load a sound
  async loadSound(id, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
      console.log(`✅ Loaded sound: ${id}`);
      return true;
    } catch (e) {
      console.warn(`⚠️ Failed to load sound: ${id}`, e);
      return false;
    }
  },

  // Play a sound
  play(soundId, volume = 1.0, loop = false, category = 'effects') {
    if (!this.audioContext || !this.sounds.has(soundId)) {
      // Fallback to simple audio
      this.playSimple(soundId, volume, loop);
      return null;
    }

    const buffer = this.sounds.get(soundId);
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = loop;

    // Apply volume
    const finalVolume = volume * this.volumes[category] * this.volumes.master;
    gainNode.gain.value = finalVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);

    const playingSound = { source, gainNode, id: soundId };
    this.playing.add(playingSound);

    source.onended = () => {
      this.playing.delete(playingSound);
    };

    return playingSound;
  },

  // Simple fallback audio
  playSimple(soundId, volume = 1.0, loop = false) {
    const audio = new Audio(`/assets/sounds/${soundId}.mp3`);
    audio.volume = volume * this.volumes.effects * this.volumes.master;
    audio.loop = loop;
    audio.play().catch((e) => console.warn('Audio play failed:', e));
    return audio;
  },

  // Stop a sound
  stop(playingSound) {
    if (playingSound && playingSound.source) {
      playingSound.source.stop();
      this.playing.delete(playingSound);
    } else if (playingSound && playingSound.pause) {
      playingSound.pause();
    }
  },

  // Set volume for a category
  setVolume(category, value) {
    this.volumes[category] = Math.max(0, Math.min(1, value));

    // Update all playing sounds in this category
    this.playing.forEach((sound) => {
      if (sound.gainNode) {
        const finalVolume = this.volumes[category] * this.volumes.master;
        sound.gainNode.gain.value = finalVolume;
      }
    });
  },

  // Predefined sound effects
  effects: {
    // Tank sounds
    ENGINE_IDLE: 'engine_idle',
    ENGINE_MOVE: 'engine_move',
    ENGINE_BOOST: 'engine_boost',
    TRACK_DAMAGE: 'track_damage',

    // Weapon sounds
    CANNON_FIRE_LIGHT: 'cannon_light',
    CANNON_FIRE_MEDIUM: 'cannon_medium',
    CANNON_FIRE_HEAVY: 'cannon_heavy',
    RELOAD: 'reload',

    // Impact sounds
    HIT_METAL: 'hit_metal',
    HIT_DIRT: 'hit_dirt',
    RICOCHET: 'ricochet',
    EXPLOSION: 'explosion',

    // Power-ups
    POWERUP_COLLECT: 'powerup_collect',
    SHIELD_ACTIVATE: 'shield_activate',
    SHIELD_HIT: 'shield_hit',
    EMP_BLAST: 'emp_blast',
    MISSILE_LAUNCH: 'missile_launch',
    MISSILE_IMPACT: 'missile_impact',

    // UI sounds
    UI_CLICK: 'ui_click',
    UI_HOVER: 'ui_hover',
    UI_ERROR: 'ui_error',
    UI_SUCCESS: 'ui_success',

    // Ambient
    WIND: 'wind',
    RAIN: 'rain',
    THUNDER: 'thunder'
  },

  // Play engine sound based on speed
  playEngineSound(speed, maxSpeed) {
    const speedRatio = speed / maxSpeed;

    if (speedRatio < 0.1) {
      return this.play(this.effects.ENGINE_IDLE, 0.3, true, 'effects');
    } else if (speedRatio < 0.7) {
      return this.play(this.effects.ENGINE_MOVE, 0.5, true, 'effects');
    } else {
      return this.play(this.effects.ENGINE_BOOST, 0.7, true, 'effects');
    }
  },

  // Play weapon sound based on tier
  playWeaponSound(weaponTier) {
    const sounds = [
    this.effects.CANNON_FIRE_LIGHT,
    this.effects.CANNON_FIRE_MEDIUM,
    this.effects.CANNON_FIRE_HEAVY];


    const soundIndex = Math.min(weaponTier - 1, sounds.length - 1);
    return this.play(sounds[soundIndex], 0.8, false, 'effects');
  },

  // Play impact sound
  playImpactSound(surfaceType = 'metal') {
    const sound = surfaceType === 'metal' ? this.effects.HIT_METAL : this.effects.HIT_DIRT;
    return this.play(sound, 0.6, false, 'effects');
  },

  // Play explosion
  playExplosion(size = 1.0) {
    return this.play(this.effects.EXPLOSION, Math.min(1.0, 0.5 + size * 0.5), false, 'effects');
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.EnhancedSoundSystem = EnhancedSoundSystem;

  // Auto-initialize when user interacts
  const initOnInteraction = () => {
    if (!EnhancedSoundSystem.audioContext) {
      EnhancedSoundSystem.init();
      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('keydown', initOnInteraction);
    }
  };

  document.addEventListener('click', initOnInteraction);
  document.addEventListener('keydown', initOnInteraction);
}