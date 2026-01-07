/**
 * Advanced Sound System for TheFortz
 * 3D positional audio, dynamic music, and sound effects
 */

const AdvancedSound = {
  // Audio context
  audioContext: null,
  masterGain: null,
  musicGain: null,
  sfxGain: null,

  // Sound pools
  sounds: {},
  music: {},

  // Active sounds
  activeSounds: [],
  currentMusic: null,

  // Settings
  settings: {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    enabled: true
  },

  // Sound library
  soundLibrary: {
    // Weapon sounds
    shoot: { file: 'shoot.mp3', volume: 0.6, poolSize: 5 },
    machinegun: { file: 'machinegun.mp3', volume: 0.5, poolSize: 3 },
    shotgun: { file: 'shotgun.mp3', volume: 0.7, poolSize: 3 },
    sniper: { file: 'sniper.mp3', volume: 0.8, poolSize: 2 },
    plasma: { file: 'plasma.mp3', volume: 0.6, poolSize: 3 },
    rocket: { file: 'rocket.mp3', volume: 0.7, poolSize: 2 },
    laser: { file: 'laser.mp3', volume: 0.5, poolSize: 3 },
    flame: { file: 'flame.mp3', volume: 0.4, poolSize: 2 },
    railgun: { file: 'railgun.mp3', volume: 0.9, poolSize: 1 },
    grenade: { file: 'grenade.mp3', volume: 0.6, poolSize: 2 },

    // Impact sounds
    hit: { file: 'hit.mp3', volume: 0.5, poolSize: 5 },
    explosion: { file: 'explosion.mp3', volume: 0.8, poolSize: 3 },
    wallHit: { file: 'wall_hit.mp3', volume: 0.4, poolSize: 5 },

    // Power-up sounds
    powerup: { file: 'powerup.mp3', volume: 0.6, poolSize: 2 },
    heal: { file: 'heal.mp3', volume: 0.5, poolSize: 2 },
    shield: { file: 'shield.mp3', volume: 0.5, poolSize: 2 },

    // UI sounds
    click: { file: 'click.mp3', volume: 0.3, poolSize: 2 },
    hover: { file: 'hover.mp3', volume: 0.2, poolSize: 2 },
    achievement: { file: 'achievement.mp3', volume: 0.7, poolSize: 1 },
    levelup: { file: 'levelup.mp3', volume: 0.8, poolSize: 1 },

    // Game sounds
    engine: { file: 'engine.mp3', volume: 0.3, poolSize: 1, loop: true },
    ambient: { file: 'ambient.mp3', volume: 0.2, poolSize: 1, loop: true }
  },

  // Music tracks
  musicLibrary: {
    menu: { file: 'menu_music.mp3', volume: 0.5 },
    gameplay: { file: 'gameplay_music.mp3', volume: 0.4 },
    intense: { file: 'intense_music.mp3', volume: 0.5 },
    victory: { file: 'victory_music.mp3', volume: 0.6 },
    defeat: { file: 'defeat_music.mp3', volume: 0.4 }
  },

  // Initialize audio system
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();

      // Connect gain nodes
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.setMasterVolume(this.settings.masterVolume);
      this.setMusicVolume(this.settings.musicVolume);
      this.setSFXVolume(this.settings.sfxVolume);

      console.log('Advanced Sound System initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  },

  // Load sound
  async loadSound(name, config) {
    try {
      const response = await fetch(`/assets/sounds/${config.file}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds[name] = {
        buffer: audioBuffer,
        config: config,
        pool: []
      };

      return true;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
      return false;
    }
  },

  // Play sound
  playSound(name, options = {}) {
    if (!this.settings.enabled || !this.sounds[name]) return null;

    const sound = this.sounds[name];
    const source = this.audioContext.createBufferSource();
    source.buffer = sound.buffer;

    // Create gain node for this sound
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = (sound.config.volume || 1.0) * (options.volume || 1.0);

    // 3D positioning if coordinates provided
    if (options.x !== undefined && options.y !== undefined) {
      const panner = this.create3DSound(options.x, options.y, options.listenerX, options.listenerY);
      source.connect(panner);
      panner.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    gainNode.connect(this.sfxGain);

    // Loop if specified
    source.loop = sound.config.loop || options.loop || false;

    // Play
    source.start(0);

    // Track active sound
    const activeSound = {
      source: source,
      gainNode: gainNode,
      name: name,
      startTime: this.audioContext.currentTime
    };

    this.activeSounds.push(activeSound);

    // Auto-cleanup
    source.onended = () => {
      this.activeSounds = this.activeSounds.filter((s) => s !== activeSound);
    };

    return activeSound;
  },

  // Create 3D positioned sound
  create3DSound(soundX, soundY, listenerX, listenerY) {
    const panner = this.audioContext.createPanner();

    // Calculate 3D position
    const distance = Math.sqrt(
      Math.pow(soundX - listenerX, 2) +
      Math.pow(soundY - listenerY, 2)
    );

    // Set panner properties
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100;
    panner.maxDistance = 1000;
    panner.rolloffFactor = 1;

    // Set position (convert 2D to 3D)
    const x = (soundX - listenerX) / 100;
    const y = 0;
    const z = (soundY - listenerY) / 100;

    panner.setPosition(x, y, z);

    return panner;
  },

  // Play music
  async playMusic(trackName, fadeIn = true) {
    if (!this.settings.enabled) return;

    // Stop current music
    if (this.currentMusic) {
      await this.stopMusic(fadeIn);
    }

    const track = this.musicLibrary[trackName];
    if (!track) return;

    try {
      // Load music if not loaded
      if (!this.music[trackName]) {
        const response = await fetch(`/assets/music/${track.file}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.music[trackName] = audioBuffer;
      }

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = this.music[trackName];
      source.loop = true;

      // Create gain for fade
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = fadeIn ? 0 : track.volume;

      source.connect(gainNode);
      gainNode.connect(this.musicGain);

      source.start(0);

      this.currentMusic = {
        source: source,
        gainNode: gainNode,
        trackName: trackName,
        targetVolume: track.volume
      };

      // Fade in
      if (fadeIn) {
        gainNode.gain.linearRampToValueAtTime(
          track.volume,
          this.audioContext.currentTime + 2
        );
      }

    } catch (error) {
      console.error('Failed to play music:', error);
    }
  },

  // Stop music
  async stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    if (fadeOut) {
      // Fade out
      this.currentMusic.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 1.5
      );

      // Stop after fade
      setTimeout(() => {
        if (this.currentMusic) {
          this.currentMusic.source.stop();
          this.currentMusic = null;
        }
      }, 1500);
    } else {
      this.currentMusic.source.stop();
      this.currentMusic = null;
    }
  },

  // Volume controls
  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
  },

  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicVolume;
    }
  },

  setSFXVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxVolume;
    }
  },

  // Stop all sounds
  stopAllSounds() {
    this.activeSounds.forEach((sound) => {
      try {
        sound.source.stop();
      } catch (e) {}
    });
    this.activeSounds = [];
  },

  // Update listener position for 3D audio
  updateListener(x, y) {
    if (this.audioContext && this.audioContext.listener) {
      const listener = this.audioContext.listener;
      if (listener.positionX) {
        listener.positionX.value = x / 100;
        listener.positionY.value = 0;
        listener.positionZ.value = y / 100;
      }
    }
  },

  // Preload all sounds
  async preloadAll() {
    const promises = [];

    for (const [name, config] of Object.entries(this.soundLibrary)) {
      promises.push(this.loadSound(name, config));
    }

    await Promise.all(promises);
    console.log('All sounds preloaded');
  }
};

// Export
if (typeof window !== 'undefined') {
  window.AdvancedSound = AdvancedSound;
}