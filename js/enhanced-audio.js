// Enhanced Audio System - 3D Spatial Audio & Dynamic Music
class EnhancedAudio {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambientGain = null;

    this.sounds = new Map();
    this.musicTracks = new Map();
    this.ambientSounds = new Map();
    this.activeSources = new Set();

    this.settings = {
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
      enable3D: true,
      enableReverb: true,
      enableDynamicMusic: true
    };

    this.currentMusicTrack = null;
    this.musicState = 'menu'; // menu, combat, victory, defeat
    this.combatIntensity = 0;

    this.initialize();
  }

  async initialize() {
    console.log('🎵 Initializing Enhanced Audio System...');

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.ambientGain = this.audioContext.createGain();

      // Connect gain nodes
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.updateVolumes();

      // Create reverb
      if (this.settings.enableReverb) {
        await this.createReverb();
      }

      // Load default sounds
      // await this.loadDefaultSounds(); // Disabled to avoid 404 errors

      console.log('✅ Enhanced Audio System initialized (audio files disabled)');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async createReverb() {
    try {
      // Create convolver for reverb
      this.reverb = this.audioContext.createConvolver();
      this.reverbGain = this.audioContext.createGain();
      this.reverbGain.gain.value = 0.3;

      // Generate impulse response
      const length = this.audioContext.sampleRate * 2;
      const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }

      this.reverb.buffer = impulse;
      this.reverb.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

    } catch (error) {
      console.warn('Reverb creation failed:', error);
    }
  }

  async loadDefaultSounds() {
    const soundFiles = {
      // Tank sounds
      'tank_move': '/assets/audio/tank_move.mp3',
      'tank_idle': '/assets/audio/tank_idle.mp3',
      'tank_brake': '/assets/audio/tank_brake.mp3',

      // Weapon sounds
      'shoot_basic': '/assets/audio/shoot_basic.mp3',
      'shoot_heavy': '/assets/audio/shoot_heavy.mp3',
      'shoot_rapid': '/assets/audio/shoot_rapid.mp3',
      'reload': '/assets/audio/reload.mp3',

      // Impact sounds
      'hit_metal': '/assets/audio/hit_metal.mp3',
      'hit_ground': '/assets/audio/hit_ground.mp3',
      'explosion_small': '/assets/audio/explosion_small.mp3',
      'explosion_large': '/assets/audio/explosion_large.mp3',

      // Power-up sounds
      'powerup_collect': '/assets/audio/powerup_collect.mp3',
      'powerup_activate': '/assets/audio/powerup_activate.mp3',
      'health_pickup': '/assets/audio/health_pickup.mp3',
      'shield_pickup': '/assets/audio/shield_pickup.mp3',

      // UI sounds
      'ui_click': '/assets/audio/ui_click.mp3',
      'ui_hover': '/assets/audio/ui_hover.mp3',
      'ui_error': '/assets/audio/ui_error.mp3',
      'ui_success': '/assets/audio/ui_success.mp3',

      // Game state sounds
      'game_start': '/assets/audio/game_start.mp3',
      'game_end': '/assets/audio/game_end.mp3',
      'victory': '/assets/audio/victory.mp3',
      'defeat': '/assets/audio/defeat.mp3',
      'kill': '/assets/audio/kill.mp3',
      'death': '/assets/audio/death.mp3'
    };

    const musicFiles = {
      'menu_theme': '/assets/music/menu_theme.mp3',
      'combat_low': '/assets/music/combat_low.mp3',
      'combat_medium': '/assets/music/combat_medium.mp3',
      'combat_high': '/assets/music/combat_high.mp3',
      'victory_theme': '/assets/music/victory_theme.mp3',
      'defeat_theme': '/assets/music/defeat_theme.mp3'
    };

    const ambientFiles = {
      'wind': '/assets/ambient/wind.mp3',
      'battle_distant': '/assets/ambient/battle_distant.mp3',
      'engine_ambient': '/assets/ambient/engine_ambient.mp3'
    };

    // Load sounds with fallback to generated sounds
    await Promise.all([
    this.loadSoundGroup(soundFiles, this.sounds, this.generateFallbackSounds),
    this.loadSoundGroup(musicFiles, this.musicTracks, this.generateFallbackMusic),
    this.loadSoundGroup(ambientFiles, this.ambientSounds, this.generateFallbackAmbient)]
    );
  }

  async loadSoundGroup(files, storage, fallbackGenerator) {
    for (const [name, url] of Object.entries(files)) {
      try {
        const buffer = await this.loadAudioBuffer(url);
        storage.set(name, buffer);
      } catch (error) {
        console.warn(`Failed to load ${name}, generating fallback`);
        const fallback = fallbackGenerator.call(this, name);
        if (fallback) {
          storage.set(name, fallback);
        }
      }
    }
  }

  async loadAudioBuffer(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  // Generate fallback sounds using Web Audio API
  generateFallbackSounds(name) {
    const sampleRate = this.audioContext.sampleRate;
    let duration, frequency, type;

    switch (name) {
      case 'shoot_basic':
        return this.generateShootSound(0.2, 150, 'square');
      case 'shoot_heavy':
        return this.generateShootSound(0.4, 80, 'sawtooth');
      case 'explosion_small':
        return this.generateExplosionSound(0.5, 100);
      case 'explosion_large':
        return this.generateExplosionSound(1.0, 60);
      case 'powerup_collect':
        return this.generatePowerUpSound();
      case 'ui_click':
        return this.generateClickSound();
      default:
        return this.generateGenericSound(0.1, 440, 'sine');
    }
  }

  generateShootSound(duration, baseFreq, waveType) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = baseFreq * (1 - t * 0.8); // Frequency sweep down
      const envelope = Math.exp(-t * 8); // Exponential decay

      let sample;
      switch (waveType) {
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * freq * t));
          break;
        case 'sawtooth':
          sample = 2 * (freq * t - Math.floor(freq * t + 0.5));
          break;
        default:
          sample = Math.sin(2 * Math.PI * freq * t);
      }

      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  generateExplosionSound(duration, baseFreq) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3);
      const noise = (Math.random() * 2 - 1) * envelope;
      const tone = Math.sin(2 * Math.PI * baseFreq * t * (1 - t * 0.5)) * envelope * 0.3;

      data[i] = (noise * 0.7 + tone * 0.3) * 0.5;
    }

    return buffer;
  }

  generatePowerUpSound() {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 440 * Math.pow(2, t * 2); // Rising frequency
      const envelope = Math.sin(Math.PI * t / duration);

      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  generateClickSound() {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50);

      data[i] = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.2;
    }

    return buffer;
  }

  generateGenericSound(duration, frequency, waveType) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 5);

      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return buffer;
  }

  generateFallbackMusic(name) {
    // Generate simple procedural music
    const duration = 30; // 30 seconds loop
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    // Simple chord progression
    const chords = [
    [261.63, 329.63, 392.00], // C major
    [293.66, 369.99, 440.00], // D minor
    [329.63, 415.30, 493.88], // E minor
    [349.23, 440.00, 523.25] // F major
    ];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor(t / duration * chords.length) % chords.length;
      const chord = chords[chordIndex];

      let sample = 0;
      chord.forEach((freq) => {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.1;
      });

      const envelope = 0.5 + 0.3 * Math.sin(2 * Math.PI * t / 4); // Slow amplitude modulation
      sample *= envelope;

      leftData[i] = sample;
      rightData[i] = sample;
    }

    return buffer;
  }

  generateFallbackAmbient(name) {
    // Generate ambient noise
    const duration = 10;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const noise = (Math.random() * 2 - 1) * 0.1;
      leftData[i] = noise;
      rightData[i] = noise;
    }

    return buffer;
  }

  // Play sound with 3D positioning
  playSound(soundId, options = {}) {
    if (!this.enabled || !this.sounds[soundId]) {
      // Silently skip missing sounds
      return;
    }
    if (!this.audioContext || this.audioContext.state === 'suspended') {
      this.resumeAudioContext();
    }

    const buffer = this.sounds.get(soundId);
    if (!buffer) {
      console.warn(`Sound '${soundId}' not found`);
      return null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    let gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 1.0;

    // 3D positioning
    if (this.settings.enable3D && options.position) {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 100;
      panner.maxDistance = 1000;
      panner.rolloffFactor = 1;

      panner.setPosition(options.position.x || 0, options.position.y || 0, 0);

      source.connect(panner);
      panner.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    // Apply reverb if enabled
    if (this.settings.enableReverb && this.reverb && options.reverb !== false) {
      const reverbSend = this.audioContext.createGain();
      reverbSend.gain.value = options.reverbAmount || 0.2;
      gainNode.connect(reverbSend);
      reverbSend.connect(this.reverb);
    }

    gainNode.connect(this.sfxGain);

    // Playback options
    if (options.loop) {
      source.loop = true;
    }

    if (options.playbackRate) {
      source.playbackRate.value = options.playbackRate;
    }

    // Start playback
    source.start(0);
    this.activeSources.add(source);

    // Cleanup when finished
    source.onended = () => {
      this.activeSources.delete(source);
    };

    return source;
  }

  // Play music - DISABLED (music rendering removed)
  async playMusic(name, options = {}) {
    return; // Music system disabled
  }

  async fadeOutMusic(track, duration) {
    return new Promise((resolve) => {
      const startTime = this.audioContext.currentTime;
      const startVolume = track.gainNode.gain.value;

      track.gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      setTimeout(() => {
        track.source.stop();
        resolve();
      }, duration * 1000);
    });
  }

  async fadeInMusic(gainNode, duration) {
    return new Promise((resolve) => {
      const startTime = this.audioContext.currentTime;
      gainNode.gain.linearRampToValueAtTime(1, startTime + duration);

      setTimeout(resolve, duration * 1000);
    });
  }

  // Dynamic music system - DISABLED
  updateMusicState(gameState) {
    return; // Music system disabled
  }

  // Ambient sound management
  playAmbientSound(name, options = {}) {
    const buffer = this.ambientSounds.get(name);
    if (!buffer) return null;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 0.5;

    source.connect(gainNode);
    gainNode.connect(this.ambientGain);

    source.start(0);

    return { source, gainNode };
  }

  // Volume controls
  updateVolumes() {
    if (this.masterGain) this.masterGain.gain.value = this.settings.masterVolume;
    if (this.musicGain) this.musicGain.gain.value = this.settings.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfxVolume;
    if (this.ambientGain) this.ambientGain.gain.value = this.settings.ambientVolume;
  }

  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setSfxVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setAmbientVolume(volume) {
    this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  // Audio context management
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed');
      }).catch((err) => {


        // Silently handle - browser autoplay policy
      });}}

  suspendAudioContext() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  // Cleanup
  stopAllSounds() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {


        // Source might already be stopped
      }});this.activeSources.clear();

    if (this.currentMusicTrack) {
      this.currentMusicTrack.source.stop();
      this.currentMusicTrack = null;
    }
  }

  cleanup() {
    this.stopAllSounds();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Global instance
window.EnhancedAudio = new EnhancedAudio();

// Auto-resume audio context on user interaction
document.addEventListener('click', () => {
  if (window.EnhancedAudio) {
    window.EnhancedAudio.resumeAudioContext();
  }
}, { once: true });

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedAudio;
}