/**
 * PianoMaster - Main Application Controller
 * Connects audio engine, pitch detection, piano UI, and lesson system
 */
class PianoMasterApp {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.pianoUI = new PianoUI('piano-keyboard');
        this.lessonEngine = new LessonEngine();

        this.currentView = 'free';
        this.isMicActive = false;
        this.lastDetectedNote = null;
        this.noteHistoryList = [];

        this.init();
    }

    async init() {
        // Initialize audio
        const audioReady = await this.audioEngine.init();
        if (!audioReady) {
            console.error('Audio initialization failed');
        }

        // Render piano
        this.pianoUI.render();

        // Setup event handlers
        this.setupNavigation();
        this.setupMicrophone();
        this.setupSettings();
        this.setupPianoControls();
        this.setupLessonCallbacks();

        // Render views
        this.renderLessonsGrid();
        this.renderSongsGrid();

        // Setup piano key click to play sound
        this.pianoUI.onKeyClick = (note, octave) => {
            this.audioEngine.playNote(note, octave, 0.8);
            this.pianoUI.highlightKey(note + octave, 'active', 400);

            // If in lesson mode, process the click as input
            if (this.lessonEngine.isActive) {
                this.lessonEngine.processNote(note, octave);
            }
        };

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // === Navigation ===
    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(view) {
        this.currentView = view;

        // Hide all views
        document.getElementById('free-practice-view').classList.add('hidden');
        document.getElementById('lessons-view').classList.add('hidden');
        document.getElementById('songs-view').classList.add('hidden');
        document.getElementById('lesson-area').classList.add('hidden');

        // Stop any active lesson
        if (view !== 'lesson-active') {
            this.lessonEngine.stop();
            this.pianoUI.clearAllHighlights();
        }

        // Show selected view
        switch (view) {
            case 'free':
                document.getElementById('free-practice-view').classList.remove('hidden');
                break;
            case 'lessons':
                document.getElementById('lessons-view').classList.remove('hidden');
                break;
            case 'songs':
                document.getElementById('songs-view').classList.remove('hidden');
                break;
        }
    }

    // === Microphone ===
    setupMicrophone() {
        const micBtn = document.getElementById('mic-btn');

        micBtn.addEventListener('click', async () => {
            if (this.isMicActive) {
                this.audioEngine.stopListening();
                this.isMicActive = false;
                micBtn.classList.remove('active');
                micBtn.querySelector('.mic-label').textContent = 'Micrófono OFF';
                document.getElementById('detected-note').textContent = '-';
                document.getElementById('detected-octave').textContent = '';
                document.getElementById('detected-frequency').textContent = 'Micrófono desactivado';
                document.getElementById('volume-bar').style.height = '0%';
            } else {
                // Setup callbacks before starting
                this.audioEngine.onPitchDetected = (result) => this.handlePitchDetected(result);
                this.audioEngine.onVolumeChange = (vol, db) => this.handleVolumeChange(vol, db);

                const started = await this.audioEngine.startListening();
                if (started) {
                    this.isMicActive = true;
                    micBtn.classList.add('active');
                    micBtn.querySelector('.mic-label').textContent = 'Micrófono ON';
                    document.getElementById('detected-frequency').textContent = 'Escuchando...';
                } else {
                    document.getElementById('detected-frequency').textContent =
                        '⚠️ No se pudo acceder al micrófono. Verifica los permisos.';
                }
            }
        });
    }

    handlePitchDetected(result) {
        const noteDisplay = document.getElementById('detected-note');
        const octaveDisplay = document.getElementById('detected-octave');
        const freqDisplay = document.getElementById('detected-frequency');
        const pitchIndicator = document.getElementById('pitch-indicator');

        // Update note display
        noteDisplay.textContent = result.note;
        octaveDisplay.textContent = `Octava ${result.octave}`;
        freqDisplay.textContent = `${result.frequency.toFixed(1)} Hz`;

        // Update pitch indicator (cents deviation)
        const centOffset = result.cents; // -50 to +50
        const position = 50 + (centOffset / 50) * 40; // map to 10%-90% of meter
        pitchIndicator.style.left = Math.max(5, Math.min(95, position)) + '%';

        if (Math.abs(centOffset) < 10) {
            pitchIndicator.classList.add('in-tune');
        } else {
            pitchIndicator.classList.remove('in-tune');
        }

        // Highlight piano key
        const fullNote = result.note + result.octave;
        if (fullNote !== this.lastDetectedNote) {
            if (this.lastDetectedNote) {
                this.pianoUI.removeHighlight(this.lastDetectedNote, 'active');
            }
            this.pianoUI.highlightKey(fullNote, 'active', 0); // persistent until changed
            this.lastDetectedNote = fullNote;

            // Add to history in free practice mode
            if (this.currentView === 'free') {
                this.addToHistory(result);
            }
        }

        // Process in lesson mode
        if (this.lessonEngine.isActive) {
            // Remove active highlight classes before processing
            noteDisplay.classList.remove('correct', 'wrong');
            this.lessonEngine.processNote(result.note, result.octave);
        }
    }

    handleVolumeChange(volume, db) {
        const volumeBar = document.getElementById('volume-bar');
        // Map dB to percentage (-60dB = 0%, 0dB = 100%)
        const percent = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
        volumeBar.style.height = percent + '%';
    }

    addToHistory(result) {
        const container = document.getElementById('history-notes');
        const el = document.createElement('span');
        el.className = 'history-note';
        el.textContent = result.note + result.octave;

        // Keep last 30 notes
        this.noteHistoryList.push(el);
        if (this.noteHistoryList.length > 30) {
            const removed = this.noteHistoryList.shift();
            removed.remove();
        }

        container.appendChild(el);
        container.scrollLeft = container.scrollWidth;
    }

    // === Settings ===
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });

        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });

        // Sensitivity
        const sensitivity = document.getElementById('mic-sensitivity');
        const sensitivityValue = document.getElementById('sensitivity-value');
        sensitivity.addEventListener('input', () => {
            sensitivityValue.textContent = sensitivity.value + '%';
        });

        // Noise threshold
        const threshold = document.getElementById('noise-threshold');
        const thresholdValue = document.getElementById('threshold-value');
        threshold.addEventListener('input', () => {
            const db = parseInt(threshold.value);
            thresholdValue.textContent = db + ' dB';
            this.audioEngine.setNoiseThreshold(db);
        });

        // Tuning reference
        const tuningRef = document.getElementById('tuning-ref');
        tuningRef.addEventListener('change', () => {
            const freq = parseInt(tuningRef.value);
            this.audioEngine.setTuningReference(freq);
        });
    }

    // === Piano Controls ===
    setupPianoControls() {
        document.getElementById('octave-down').addEventListener('click', () => {
            this.pianoUI.shiftDown();
        });

        document.getElementById('octave-up').addEventListener('click', () => {
            this.pianoUI.shiftUp();
        });

        document.getElementById('show-labels').addEventListener('change', (e) => {
            this.pianoUI.setShowLabels(e.target.checked);
        });

        document.getElementById('show-solfege').addEventListener('change', (e) => {
            this.pianoUI.setShowSolfege(e.target.checked);
        });
    }

    // === Lessons ===
    renderLessonsGrid() {
        const grid = document.getElementById('lessons-grid');
        const progress = LessonEngine.getProgress();

        grid.innerHTML = '';

        // Group by category
        const categories = {};
        LESSONS.forEach(lesson => {
            if (!categories[lesson.category]) {
                categories[lesson.category] = [];
            }
            categories[lesson.category].push(lesson);
        });

        Object.entries(categories).forEach(([category, lessons]) => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryHeader.style.gridColumn = '1 / -1';
            categoryHeader.style.color = 'var(--text-secondary)';
            categoryHeader.style.fontSize = '1rem';
            categoryHeader.style.marginTop = '8px';
            grid.appendChild(categoryHeader);

            lessons.forEach(lesson => {
                const card = document.createElement('div');
                card.className = 'lesson-card';
                if (progress[lesson.id]?.completed) {
                    card.classList.add('completed');
                }

                card.innerHTML = `
                    <span class="card-level ${lesson.level}">${this.translateLevel(lesson.level)}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                    <span class="lesson-type-badge">📝 ${lesson.sequence.length} notas</span>
                `;

                card.addEventListener('click', () => this.startLesson(lesson));
                grid.appendChild(card);
            });
        });
    }

    renderSongsGrid() {
        const grid = document.getElementById('songs-grid');
        grid.innerHTML = '';

        SONGS.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';

            const stars = Array(5).fill(null).map((_, i) =>
                `<span class="star ${i < song.difficulty ? '' : 'empty'}">★</span>`
            ).join('');

            card.innerHTML = `
                <h3>${song.title}</h3>
                <p>${song.description}</p>
                <div class="song-meta">
                    <span class="song-key">🎵 ${song.key}</span>
                    <div class="song-difficulty">${stars}</div>
                </div>
            `;

            card.addEventListener('click', () => this.startSong(song));
            grid.appendChild(card);
        });
    }

    startLesson(lesson) {
        this.switchView('lesson-active');
        document.getElementById('lesson-area').classList.remove('hidden');
        document.getElementById('free-practice-view').classList.add('hidden');
        document.getElementById('lessons-view').classList.add('hidden');
        document.getElementById('songs-view').classList.add('hidden');

        // Set up lesson UI
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-instructions').textContent =
            lesson.instructions + (lesson.tips ? '\n\n💡 Consejo: ' + lesson.tips : '');

        // Render note sequence
        this.renderNoteSequence(lesson.sequence);

        // Reset progress
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('progress-text').textContent = '0%';
        document.getElementById('correct-count').textContent = '0';
        document.getElementById('wrong-count').textContent = '0';
        document.getElementById('streak-count').textContent = '0';
        document.getElementById('feedback-message').textContent = '';

        // Setup back button
        document.getElementById('lesson-back-btn').onclick = () => {
            this.lessonEngine.stop();
            this.pianoUI.clearAllHighlights();
            this.switchView('lessons');
            // Re-activate nav button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.nav-btn[data-view="lessons"]').classList.add('active');
        };

        // Start the lesson engine
        this.lessonEngine.start(lesson);
    }

    startSong(song) {
        // Convert song to lesson format
        const lessonFromSong = {
            id: song.id,
            title: song.title,
            level: song.difficulty <= 1 ? 'beginner' : song.difficulty <= 2 ? 'intermediate' : 'advanced',
            description: song.description,
            instructions: `Toca "${song.title}" de ${song.artist}. Sigue las notas que aparecen en pantalla. Tonalidad: ${song.key}.`,
            sequence: song.sequence,
            tips: 'Empieza lento y ve aumentando la velocidad a medida que memorices la melodía.'
        };
        this.startLesson(lessonFromSong);

        // Re-activate nav button for songs
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.nav-btn[data-view="songs"]').classList.add('active');

        // Override back button to go to songs
        document.getElementById('lesson-back-btn').onclick = () => {
            this.lessonEngine.stop();
            this.pianoUI.clearAllHighlights();
            this.switchView('songs');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.nav-btn[data-view="songs"]').classList.add('active');
        };
    }

    renderNoteSequence(sequence) {
        const container = document.getElementById('note-sequence');
        container.innerHTML = '';

        sequence.forEach((noteData, index) => {
            const el = document.createElement('div');
            el.className = 'seq-note';
            if (index === 0) el.classList.add('current');
            else el.classList.add('pending');

            el.id = `seq-note-${index}`;
            el.innerHTML = `
                ${noteData.note}${noteData.octave}
                <span class="seq-note-sub">${this.getSolfege(noteData.note)}</span>
            `;

            container.appendChild(el);
        });
    }

    setupLessonCallbacks() {
        // When a note is expected
        this.lessonEngine.onNoteExpected = (data) => {
            const fullNote = data.note + data.octave;

            // Highlight expected key on piano
            this.pianoUI.clearAllHighlights();
            this.pianoUI.setHighlight(fullNote, 'highlight');

            // Update sequence display
            const seqNote = document.getElementById(`seq-note-${data.index}`);
            if (seqNote) {
                seqNote.classList.add('current', 'waiting');
                seqNote.classList.remove('pending');

                // Scroll into view
                seqNote.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }

            const feedbackMsg = document.getElementById('feedback-message');
            feedbackMsg.textContent = `Toca: ${data.note}${data.octave} (${this.getSolfege(data.note)})`;
            feedbackMsg.className = 'info';
        };

        // When a note is played (correct or wrong)
        this.lessonEngine.onNoteResult = (data) => {
            const noteDisplay = document.getElementById('detected-note');
            const seqNote = document.getElementById(`seq-note-${data.index}`);
            const feedbackMsg = document.getElementById('feedback-message');
            const detectedFull = data.detected.note + data.detected.octave;

            if (data.isCorrect) {
                // Correct note
                noteDisplay.classList.add('correct');
                noteDisplay.classList.remove('wrong');

                if (seqNote) {
                    seqNote.classList.remove('current', 'waiting');
                    seqNote.classList.add('correct');
                }

                this.pianoUI.showFeedback(detectedFull, true, 400);
                feedbackMsg.textContent = this.getRandomCorrectMessage();
                feedbackMsg.className = 'correct';

                // Quick remove correct class from note display
                setTimeout(() => noteDisplay.classList.remove('correct'), 300);
            } else {
                // Wrong note
                noteDisplay.classList.add('wrong');
                noteDisplay.classList.remove('correct');

                this.pianoUI.showFeedback(detectedFull, false, 400);

                const expected = data.expected;
                feedbackMsg.textContent = `✗ Tocaste ${data.detected.note}${data.detected.octave}, se esperaba ${expected.note}${expected.octave}`;
                feedbackMsg.className = 'wrong';

                setTimeout(() => noteDisplay.classList.remove('wrong'), 300);
            }

            // Update score
            document.getElementById('correct-count').textContent = data.score.correct;
            document.getElementById('wrong-count').textContent = data.score.wrong;
            document.getElementById('streak-count').textContent = data.score.streak;
        };

        // Progress update
        this.lessonEngine.onProgressUpdate = (progress) => {
            const percent = Math.round(progress * 100);
            document.getElementById('progress-fill').style.width = percent + '%';
            document.getElementById('progress-text').textContent = percent + '%';
        };

        // Lesson complete
        this.lessonEngine.onLessonComplete = (data) => {
            this.pianoUI.clearAllHighlights();
            this.showCompletionModal(data);
            this.renderLessonsGrid(); // Refresh to show completed state
        };
    }

    showCompletionModal(data) {
        const modal = document.getElementById('completion-modal');
        const stats = document.getElementById('completion-stats');
        const title = document.getElementById('completion-title');
        const icon = document.getElementById('completion-icon');

        const duration = Math.round(data.duration / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        if (data.accuracy >= 90) {
            icon.textContent = '🏆';
            title.textContent = '¡Perfecto!';
        } else if (data.accuracy >= 70) {
            icon.textContent = '🎉';
            title.textContent = '¡Muy Bien!';
        } else if (data.accuracy >= 50) {
            icon.textContent = '👍';
            title.textContent = '¡Buen Intento!';
        } else {
            icon.textContent = '💪';
            title.textContent = 'Sigue Practicando';
        }

        stats.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Precisión</span>
                <span class="stat-value ${data.accuracy >= 70 ? 'good' : 'bad'}">${data.accuracy}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Notas correctas</span>
                <span class="stat-value good">${data.score.correct}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Notas incorrectas</span>
                <span class="stat-value ${data.score.wrong > 0 ? 'bad' : 'good'}">${data.score.wrong}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Mejor racha</span>
                <span class="stat-value">🔥 ${data.score.maxStreak}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Tiempo</span>
                <span class="stat-value">${timeStr}</span>
            </div>
        `;

        // Retry button
        document.getElementById('retry-lesson').onclick = () => {
            modal.classList.add('hidden');
            this.lessonEngine.reset();
            this.renderNoteSequence(data.lesson.sequence);
            document.getElementById('progress-fill').style.width = '0%';
            document.getElementById('progress-text').textContent = '0%';
            document.getElementById('correct-count').textContent = '0';
            document.getElementById('wrong-count').textContent = '0';
            document.getElementById('streak-count').textContent = '0';
        };

        // Next lesson button
        document.getElementById('next-lesson').onclick = () => {
            modal.classList.add('hidden');
            const currentId = data.lesson.id;
            // Find next lesson in LESSONS or SONGS
            const allItems = [...LESSONS, ...SONGS.map(s => ({
                ...s,
                instructions: `Toca "${s.title}" de ${s.artist}.`,
                level: s.difficulty <= 1 ? 'beginner' : s.difficulty <= 2 ? 'intermediate' : 'advanced',
            }))];
            const currentIndex = allItems.findIndex(l => l.id === currentId);
            if (currentIndex < allItems.length - 1) {
                const next = allItems[currentIndex + 1];
                if (SONGS.find(s => s.id === next.id)) {
                    this.startSong(next);
                } else {
                    this.startLesson(next);
                }
            } else {
                this.switchView('lessons');
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.nav-btn[data-view="lessons"]').classList.add('active');
            }
        };

        modal.classList.remove('hidden');
    }

    // === Keyboard Shortcuts ===
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space to toggle mic
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                document.getElementById('mic-btn').click();
            }

            // Escape to go back
            if (e.code === 'Escape') {
                const settingsModal = document.getElementById('settings-modal');
                const completionModal = document.getElementById('completion-modal');
                if (!settingsModal.classList.contains('hidden')) {
                    settingsModal.classList.add('hidden');
                } else if (!completionModal.classList.contains('hidden')) {
                    completionModal.classList.add('hidden');
                }
            }

            // Computer keyboard to piano mapping (for testing without a real piano)
            const keyMap = {
                'KeyA': { note: 'C', octave: 4 },
                'KeyW': { note: 'C#', octave: 4 },
                'KeyS': { note: 'D', octave: 4 },
                'KeyE': { note: 'D#', octave: 4 },
                'KeyD': { note: 'E', octave: 4 },
                'KeyF': { note: 'F', octave: 4 },
                'KeyT': { note: 'F#', octave: 4 },
                'KeyG': { note: 'G', octave: 4 },
                'KeyY': { note: 'G#', octave: 4 },
                'KeyH': { note: 'A', octave: 4 },
                'KeyU': { note: 'A#', octave: 4 },
                'KeyJ': { note: 'B', octave: 4 },
                'KeyK': { note: 'C', octave: 5 },
                'KeyO': { note: 'C#', octave: 5 },
                'KeyL': { note: 'D', octave: 5 },
            };

            if (keyMap[e.code] && !e.repeat) {
                const { note, octave } = keyMap[e.code];
                this.audioEngine.playNote(note, octave, 0.5);
                this.pianoUI.highlightKey(note + octave, 'active', 300);

                if (this.lessonEngine.isActive) {
                    this.lessonEngine.processNote(note, octave);
                }

                if (this.currentView === 'free') {
                    this.addToHistory({ note, octave });
                }
            }
        });
    }

    // === Helpers ===
    translateLevel(level) {
        const map = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
        return map[level] || level;
    }

    getSolfege(note) {
        const map = {
            'C': 'Do', 'C#': 'Do#', 'D': 'Re', 'D#': 'Re#', 'E': 'Mi',
            'F': 'Fa', 'F#': 'Fa#', 'G': 'Sol', 'G#': 'Sol#', 'A': 'La',
            'A#': 'La#', 'B': 'Si'
        };
        return map[note] || note;
    }

    getRandomCorrectMessage() {
        const messages = [
            '¡Correcto! ✓',
            '¡Muy bien! ✓',
            '¡Excelente! ✓',
            '¡Perfecto! ✓',
            '¡Así se hace! ✓',
            '¡Genial! ✓',
            '¡Sigue así! ✓',
            '¡Bravo! ✓',
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// === Start the app ===
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PianoMasterApp();
});
