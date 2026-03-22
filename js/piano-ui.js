/**
 * PianoUI - Renders and manages the visual piano keyboard
 * Handles key highlighting, click/touch interaction, and label display
 */
class PianoUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.keys = {};
        this.startOctave = 3;
        this.endOctave = 5;
        this.showLabels = true;
        this.showSolfege = false;
        this.activeKeys = new Set();

        // Callbacks
        this.onKeyClick = null;

        // Note layout
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.solfegeNames = {
            'C': 'Do', 'C#': 'Do#', 'D': 'Re', 'D#': 'Re#', 'E': 'Mi',
            'F': 'Fa', 'F#': 'Fa#', 'G': 'Sol', 'G#': 'Sol#', 'A': 'La',
            'A#': 'La#', 'B': 'Si'
        };

        // Black key positions (relative to white key widths)
        this.blackKeyOffsets = {
            'C#': 0.6, 'D#': 1.75, 'F#': 3.6, 'G#': 4.7, 'A#': 5.8
        };
    }

    /**
     * Render the piano keyboard
     */
    render() {
        this.container.innerHTML = '';
        this.keys = {};

        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];

        // Count total white keys
        let totalWhiteKeys = 0;
        for (let octave = this.startOctave; octave <= this.endOctave; octave++) {
            for (const note of whiteNotes) {
                if (octave === this.endOctave && note !== 'C') continue;
                totalWhiteKeys++;
            }
        }

        const whiteKeyWidth = 100 / totalWhiteKeys; // percentage

        // Render white keys first (flex: 1 handles sizing/positioning)
        let whiteIndex = 0;
        for (let octave = this.startOctave; octave <= this.endOctave; octave++) {
            for (const note of whiteNotes) {
                if (octave === this.endOctave && note !== 'C') continue;

                const key = this.createKey(note, octave, 'white');
                this.container.appendChild(key);
                this.keys[note + octave] = key;
                whiteIndex++;
            }
        }

        // Render black keys on top
        whiteIndex = 0;
        for (let octave = this.startOctave; octave <= this.endOctave; octave++) {
            if (octave === this.endOctave) break;

            for (const note of whiteNotes) {
                const sharpNote = note + '#';
                if (blackNotes.includes(sharpNote)) {
                    const key = this.createKey(sharpNote, octave, 'black');
                    // Position black key between white keys
                    const offset = whiteIndex * whiteKeyWidth + whiteKeyWidth * 0.65;
                    key.style.left = offset + '%';
                    key.style.width = (whiteKeyWidth * 0.7) + '%';
                    this.container.appendChild(key);
                    this.keys[sharpNote + octave] = key;
                }
                whiteIndex++;
            }
        }

        this.updateLabels();
    }

    /**
     * Create a single piano key element
     */
    createKey(note, octave, type) {
        const key = document.createElement('div');
        key.className = `piano-key ${type}`;
        key.dataset.note = note;
        key.dataset.octave = octave;
        key.dataset.fullNote = note + octave;

        // Label
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = note;
        key.appendChild(label);

        // Solfege label
        const solfege = document.createElement('span');
        solfege.className = 'key-solfege';
        solfege.textContent = this.solfegeNames[note] || '';
        solfege.style.display = this.showSolfege ? 'block' : 'none';
        key.appendChild(solfege);

        // Click/touch handlers
        const handleInteraction = (e) => {
            e.preventDefault();
            if (this.onKeyClick) {
                this.onKeyClick(note, octave);
            }
        };

        key.addEventListener('mousedown', handleInteraction);
        key.addEventListener('touchstart', handleInteraction, { passive: false });

        return key;
    }

    /**
     * Highlight a key (when detected or played)
     */
    highlightKey(fullNote, className = 'active', duration = 300) {
        const key = this.keys[fullNote];
        if (!key) return;

        key.classList.add(className);
        this.activeKeys.add(fullNote);

        if (duration > 0) {
            setTimeout(() => {
                key.classList.remove(className);
                this.activeKeys.delete(fullNote);
            }, duration);
        }
    }

    /**
     * Set persistent highlight on a key (for lessons)
     */
    setHighlight(fullNote, className = 'highlight') {
        const key = this.keys[fullNote];
        if (key) {
            key.classList.add(className);
        }
    }

    /**
     * Remove highlight from a key
     */
    removeHighlight(fullNote, className = 'highlight') {
        const key = this.keys[fullNote];
        if (key) {
            key.classList.remove(className);
        }
    }

    /**
     * Clear all highlights
     */
    clearAllHighlights() {
        Object.values(this.keys).forEach(key => {
            key.classList.remove('active', 'highlight', 'correct-hit', 'wrong-hit');
        });
        this.activeKeys.clear();
    }

    /**
     * Show correct/wrong feedback on a key
     */
    showFeedback(fullNote, isCorrect, duration = 500) {
        const className = isCorrect ? 'correct-hit' : 'wrong-hit';
        this.highlightKey(fullNote, className, duration);
    }

    /**
     * Toggle note labels visibility
     */
    setShowLabels(show) {
        this.showLabels = show;
        this.updateLabels();
    }

    /**
     * Toggle solfege labels
     */
    setShowSolfege(show) {
        this.showSolfege = show;
        this.updateLabels();
    }

    /**
     * Update label visibility
     */
    updateLabels() {
        Object.values(this.keys).forEach(key => {
            const label = key.querySelector('.key-label');
            const solfege = key.querySelector('.key-solfege');
            if (label) {
                label.style.display = this.showLabels ? 'block' : 'none';
            }
            if (solfege) {
                solfege.style.display = this.showSolfege ? 'block' : 'none';
            }
        });
    }

    /**
     * Change octave range
     */
    setOctaveRange(start, end) {
        this.startOctave = Math.max(1, Math.min(start, 6));
        this.endOctave = Math.max(this.startOctave + 1, Math.min(end, 7));
        this.render();
        this.updateOctaveDisplay();
    }

    /**
     * Shift octaves up
     */
    shiftUp() {
        if (this.endOctave < 7) {
            this.setOctaveRange(this.startOctave + 1, this.endOctave + 1);
        }
    }

    /**
     * Shift octaves down
     */
    shiftDown() {
        if (this.startOctave > 1) {
            this.setOctaveRange(this.startOctave - 1, this.endOctave - 1);
        }
    }

    /**
     * Update the octave range display
     */
    updateOctaveDisplay() {
        const display = document.getElementById('octave-range');
        if (display) {
            display.textContent = `C${this.startOctave} - C${this.endOctave}`;
        }
    }

    /**
     * Scroll to ensure a key is visible (useful for wide ranges)
     */
    scrollToKey(fullNote) {
        const key = this.keys[fullNote];
        if (key) {
            key.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }
}
