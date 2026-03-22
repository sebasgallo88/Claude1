/**
 * AudioEngine - Handles microphone input, audio analysis, and sound synthesis
 * Uses Web Audio API for real-time audio processing
 */
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.stream = null;
        this.isListening = false;
        this.pitchDetector = null;

        // Audio buffers
        this.bufferSize = 4096;
        this.dataBuffer = new Float32Array(this.bufferSize);
        this.frequencyData = null;

        // Detection callback
        this.onPitchDetected = null;
        this.onVolumeChange = null;

        // Volume / noise gate
        this.noiseThreshold = -40; // dB
        this.animationFrameId = null;

        // Synth for playback
        this.synthOscillators = {};
    }

    /**
     * Initialize audio context and pitch detector
     */
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.pitchDetector = new PitchDetector(this.audioContext.sampleRate, this.bufferSize);

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.bufferSize * 2;
            this.analyser.smoothingTimeConstant = 0.8;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            return true;
        } catch (e) {
            console.error('Failed to initialize audio:', e);
            return false;
        }
    }

    /**
     * Start listening to microphone
     */
    async startListening() {
        if (this.isListening) return true;

        try {
            // Resume audio context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    // High quality for better pitch detection
                    sampleRate: { ideal: 44100 },
                    channelCount: 1
                }
            });

            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.microphone.connect(this.analyser);

            this.isListening = true;
            this.pitchDetector.reset();

            // Start detection loop
            this.detectLoop();

            return true;
        } catch (e) {
            console.error('Microphone access denied:', e);
            return false;
        }
    }

    /**
     * Stop listening to microphone
     */
    stopListening() {
        if (!this.isListening) return;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.isListening = false;
    }

    /**
     * Main detection loop - runs on each animation frame
     */
    detectLoop() {
        if (!this.isListening) return;

        // Get time-domain data for pitch detection
        this.analyser.getFloatTimeDomainData(this.dataBuffer);

        // Get frequency data for volume
        this.analyser.getByteFrequencyData(this.frequencyData);

        // Calculate RMS volume
        const volume = this.calculateRMS(this.dataBuffer);
        const volumeDb = 20 * Math.log10(Math.max(volume, 1e-10));

        if (this.onVolumeChange) {
            this.onVolumeChange(volume, volumeDb);
        }

        // Only detect pitch if volume is above noise threshold
        if (volumeDb > this.noiseThreshold) {
            const result = this.pitchDetector.detect(this.dataBuffer);
            if (result && this.onPitchDetected) {
                this.onPitchDetected(result);
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
    }

    /**
     * Calculate RMS (Root Mean Square) volume
     */
    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Set noise threshold in dB
     */
    setNoiseThreshold(db) {
        this.noiseThreshold = db;
    }

    /**
     * Set tuning reference
     */
    setTuningReference(freq) {
        if (this.pitchDetector) {
            this.pitchDetector.setA4(freq);
        }
    }

    /**
     * Play a note using Web Audio synthesis (for demonstration/playback)
     */
    playNote(noteName, octave, duration = 0.5) {
        if (!this.audioContext) return;

        const key = noteName + octave;

        // Stop existing note if playing
        this.stopNote(key);

        const freq = this.pitchDetector.noteToFrequency(noteName, octave);
        if (freq === 0) return;

        // Create oscillator with piano-like timbre
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Use triangle wave for piano-like sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        // Add harmonics for richer sound
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, this.audioContext.currentTime);
        const gain2 = this.audioContext.createGain();
        gain2.gain.setValueAtTime(0.15, this.audioContext.currentTime);

        // ADSR envelope for piano-like attack/decay
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1); // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

        osc.connect(gainNode);
        osc2.connect(gain2);
        gain2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + duration);
        osc2.stop(now + duration);

        this.synthOscillators[key] = { osc, osc2, gainNode, gain2 };

        // Cleanup after note ends
        osc.onended = () => {
            delete this.synthOscillators[key];
        };
    }

    /**
     * Stop a specific playing note
     */
    stopNote(key) {
        if (this.synthOscillators[key]) {
            try {
                this.synthOscillators[key].osc.stop();
                this.synthOscillators[key].osc2.stop();
            } catch (e) {
                // Already stopped
            }
            delete this.synthOscillators[key];
        }
    }

    /**
     * Play a sequence of notes (for lesson demos)
     */
    async playSequence(notes, bpm = 100) {
        const beatDuration = 60 / bpm;

        for (const noteData of notes) {
            if (noteData.rest) {
                await this.sleep(beatDuration * (noteData.duration || 1) * 1000);
                continue;
            }

            const duration = beatDuration * (noteData.duration || 1);
            this.playNote(noteData.note, noteData.octave, duration);
            await this.sleep(duration * 1000);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopListening();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
