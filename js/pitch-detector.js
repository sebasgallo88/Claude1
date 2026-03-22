/**
 * PitchDetector - YIN algorithm implementation for accurate pitch detection
 * The YIN algorithm is one of the best methods for monophonic pitch detection,
 * offering excellent accuracy for musical instrument recognition.
 *
 * Reference: "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara (2002)
 */
class PitchDetector {
    constructor(sampleRate, bufferSize = 4096) {
        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;
        this.threshold = 0.15; // YIN threshold (lower = more selective)
        this.probabilityThreshold = 0.1;

        // Pre-allocate buffers for performance
        this.yinBuffer = new Float32Array(Math.floor(bufferSize / 2));

        // Note names and frequencies
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.solfegeNames = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

        // A4 reference frequency (configurable for different tunings)
        this.a4Frequency = 440;

        // Smoothing: keep last N detections to reduce jitter
        this.detectionHistory = [];
        this.historySize = 3;
    }

    /**
     * Set the A4 reference frequency
     */
    setA4(frequency) {
        this.a4Frequency = frequency;
    }

    /**
     * Main detection method using YIN algorithm
     * Returns: { frequency, note, octave, cents, confidence } or null
     */
    detect(audioBuffer) {
        const frequency = this.yinDetect(audioBuffer);

        if (frequency === -1) {
            return null;
        }

        // Apply median smoothing to reduce jitter
        this.detectionHistory.push(frequency);
        if (this.detectionHistory.length > this.historySize) {
            this.detectionHistory.shift();
        }

        const smoothedFreq = this.medianFrequency();
        const noteInfo = this.frequencyToNote(smoothedFreq);

        return {
            frequency: smoothedFreq,
            rawFrequency: frequency,
            ...noteInfo
        };
    }

    /**
     * YIN pitch detection algorithm
     * Returns frequency in Hz or -1 if no pitch detected
     */
    yinDetect(buffer) {
        const halfBufferSize = Math.floor(buffer.length / 2);
        const yinBuffer = this.yinBuffer;

        // Step 1: Difference function
        // d(τ) = Σ (x[j] - x[j+τ])²
        let running;
        let delta;

        for (let tau = 0; tau < halfBufferSize; tau++) {
            yinBuffer[tau] = 0;
        }

        for (let tau = 1; tau < halfBufferSize; tau++) {
            yinBuffer[tau] = 0;
            for (let j = 0; j < halfBufferSize; j++) {
                delta = buffer[j] - buffer[j + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        // Step 2: Cumulative mean normalized difference function
        // d'(τ) = d(τ) / [(1/τ) * Σ d(j)] for j=1..τ
        yinBuffer[0] = 1;
        running = 0;
        for (let tau = 1; tau < halfBufferSize; tau++) {
            running += yinBuffer[tau];
            yinBuffer[tau] *= tau / running;
        }

        // Step 3: Absolute threshold
        // Find first tau where d'(τ) < threshold
        let tauEstimate = -1;
        for (let tau = 2; tau < halfBufferSize; tau++) {
            if (yinBuffer[tau] < this.threshold) {
                while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                tauEstimate = tau;
                break;
            }
        }

        if (tauEstimate === -1) {
            return -1;
        }

        // Step 4: Parabolic interpolation for sub-sample accuracy
        let betterTau;
        const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
        const x2 = tauEstimate + 1 < halfBufferSize ? tauEstimate + 1 : tauEstimate;

        if (x0 === tauEstimate) {
            betterTau = yinBuffer[tauEstimate] <= yinBuffer[x2] ? tauEstimate : x2;
        } else if (x2 === tauEstimate) {
            betterTau = yinBuffer[tauEstimate] <= yinBuffer[x0] ? tauEstimate : x0;
        } else {
            const s0 = yinBuffer[x0];
            const s1 = yinBuffer[tauEstimate];
            const s2 = yinBuffer[x2];
            betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        const frequency = this.sampleRate / betterTau;

        // Sanity check: piano range is ~27.5Hz (A0) to ~4186Hz (C8)
        if (frequency < 25 || frequency > 4500) {
            return -1;
        }

        return frequency;
    }

    /**
     * Get median of recent frequency detections for smoothing
     */
    medianFrequency() {
        if (this.detectionHistory.length === 0) return 0;
        const sorted = [...this.detectionHistory].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    /**
     * Convert frequency to musical note information
     */
    frequencyToNote(frequency) {
        // Calculate semitones from A4
        const semitones = 12 * Math.log2(frequency / this.a4Frequency);

        // Round to nearest semitone
        const roundedSemitones = Math.round(semitones);

        // Calculate cents deviation (100 cents = 1 semitone)
        const cents = Math.round((semitones - roundedSemitones) * 100);

        // Calculate note index (A = 9 in our array, since C=0)
        // A4 is the 9th note (0-indexed) in octave 4
        let noteIndex = ((roundedSemitones % 12) + 9) % 12;
        if (noteIndex < 0) noteIndex += 12;

        // Calculate octave
        const octave = 4 + Math.floor((roundedSemitones + 9) / 12);

        // MIDI note number (for reference)
        const midi = 69 + roundedSemitones;

        return {
            note: this.noteNames[noteIndex],
            solfege: this.solfegeNames[noteIndex],
            octave: octave,
            cents: cents,
            midi: midi,
            noteIndex: noteIndex,
            // Full note name like "C4", "F#3"
            fullNote: this.noteNames[noteIndex] + octave,
            // Whether this is a sharp/flat (black key)
            isBlack: this.noteNames[noteIndex].includes('#')
        };
    }

    /**
     * Get frequency for a given note name and octave
     */
    noteToFrequency(noteName, octave) {
        const noteIndex = this.noteNames.indexOf(noteName);
        if (noteIndex === -1) return 0;

        // Semitones from A4
        const semitones = (noteIndex - 9) + (octave - 4) * 12;
        return this.a4Frequency * Math.pow(2, semitones / 12);
    }

    /**
     * Check if two notes match (considering enharmonic equivalents)
     */
    static notesMatch(note1, note2) {
        // Direct match
        if (note1 === note2) return true;

        // Enharmonic equivalents
        const enharmonics = {
            'C#': 'Db', 'Db': 'C#',
            'D#': 'Eb', 'Eb': 'D#',
            'F#': 'Gb', 'Gb': 'F#',
            'G#': 'Ab', 'Ab': 'G#',
            'A#': 'Bb', 'Bb': 'A#'
        };

        return enharmonics[note1] === note2;
    }

    /**
     * Reset detection history (call when starting a new lesson/exercise)
     */
    reset() {
        this.detectionHistory = [];
    }
}
