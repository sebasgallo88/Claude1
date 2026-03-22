/**
 * Lessons - Progressive piano lesson system
 *
 * Pedagogy approach:
 * 1. Start with individual notes (C position - right hand)
 * 2. Progress to simple intervals
 * 3. Introduce scales (C major first, then others)
 * 4. Basic chords
 * 5. Simple melodies
 *
 * Each lesson includes:
 * - Theory explanation
 * - Note sequence to practice
 * - Expected notes for real-time correction
 */

const LESSONS = [
    // === BEGINNER - Getting Started ===
    {
        id: 'intro-c',
        title: 'Conoce el Do Central (C4)',
        level: 'beginner',
        category: 'Primeros Pasos',
        description: 'Aprende a encontrar y tocar el Do central, la nota más importante del piano.',
        instructions: 'El Do central (C4) es el punto de referencia del piano. Está en el centro del teclado. Toca el Do central 5 veces seguidas. Escucha su sonido y memorízalo.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'C', octave: 4 },
        ],
        tips: 'Usa el dedo pulgar (1) de la mano derecha para tocar el Do central.'
    },
    {
        id: 'intro-cde',
        title: 'Primeras Tres Notas: Do-Re-Mi',
        level: 'beginner',
        category: 'Primeros Pasos',
        description: 'Aprende las tres primeras notas de la escala: Do, Re y Mi.',
        instructions: 'Toca Do (C4), Re (D4) y Mi (E4) en orden. Usa los dedos pulgar (1), índice (2) y medio (3) de la mano derecha.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
        ],
        tips: 'Mantén la mano relajada y los dedos curvados. Cada dedo toca una tecla.'
    },
    {
        id: 'intro-5notes',
        title: 'Posición de Do: 5 Notas',
        level: 'beginner',
        category: 'Primeros Pasos',
        description: 'Domina la posición de Do con las 5 notas: Do-Re-Mi-Fa-Sol.',
        instructions: 'La "posición de Do" usa los 5 dedos de la mano derecha: pulgar en Do, índice en Re, medio en Mi, anular en Fa, meñique en Sol.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
        ],
        tips: 'Sube y baja por las 5 notas. Intenta hacerlo sin mirar el teclado.'
    },

    // === BEGINNER - Scales ===
    {
        id: 'scale-c-major-simple',
        title: 'Escala de Do Mayor (1 Octava)',
        level: 'beginner',
        category: 'Escalas',
        description: 'Aprende la escala más fundamental: Do Mayor. La base de toda la música occidental.',
        instructions: 'Toca la escala de Do Mayor subiendo y bajando: Do-Re-Mi-Fa-Sol-La-Si-Do. Al llegar a Fa, pasa el pulgar por debajo del dedo medio.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'B', octave: 4 },
            { note: 'C', octave: 5 },
            { note: 'B', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
        ],
        tips: 'La escala de Do Mayor no tiene sostenidos ni bemoles. Solo teclas blancas.'
    },
    {
        id: 'intervals-2nd-3rd',
        title: 'Intervalos: Segundas y Terceras',
        level: 'beginner',
        category: 'Intervalos',
        description: 'Aprende a reconocer intervalos de segunda (1 tecla) y tercera (2 teclas).',
        instructions: 'Toca los intervalos indicados. Una segunda es la nota inmediatamente al lado. Una tercera salta una nota.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },  // 2nd
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },  // 3rd
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },  // 2nd
            { note: 'D', octave: 4 },
            { note: 'F', octave: 4 },  // 3rd
            { note: 'E', octave: 4 },
            { note: 'F', octave: 4 },  // 2nd
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },  // 3rd
        ],
        tips: 'Escucha la diferencia entre el salto pequeño (segunda) y el salto más grande (tercera).'
    },

    // === INTERMEDIATE ===
    {
        id: 'scale-g-major',
        title: 'Escala de Sol Mayor',
        level: 'intermediate',
        category: 'Escalas',
        description: 'La escala de Sol Mayor tiene un sostenido: Fa#. Tu primer paso hacia las tonalidades con alteraciones.',
        instructions: 'Toca Sol-La-Si-Do-Re-Mi-Fa#-Sol. Nota el Fa# (tecla negra) antes de llegar al Sol alto.',
        sequence: [
            { note: 'G', octave: 3 },
            { note: 'A', octave: 3 },
            { note: 'B', octave: 3 },
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F#', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'F#', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'B', octave: 3 },
            { note: 'A', octave: 3 },
            { note: 'G', octave: 3 },
        ],
        tips: 'El Fa# es la tecla negra entre Fa y Sol. Usa el dedo 4 (anular) para tocarlo.'
    },
    {
        id: 'scale-f-major',
        title: 'Escala de Fa Mayor',
        level: 'intermediate',
        category: 'Escalas',
        description: 'La escala de Fa Mayor tiene un bemol: Si♭. Aprende tu primera escala con bemol.',
        instructions: 'Toca Fa-Sol-La-Si♭-Do-Re-Mi-Fa. El Si♭ es la tecla negra a la izquierda de Si.',
        sequence: [
            { note: 'F', octave: 3 },
            { note: 'G', octave: 3 },
            { note: 'A', octave: 3 },
            { note: 'A#', octave: 3 },
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'A#', octave: 3 },
            { note: 'A', octave: 3 },
            { note: 'G', octave: 3 },
            { note: 'F', octave: 3 },
        ],
        tips: 'En Fa Mayor, el dedo pulgar pasa por debajo al llegar al Si♭. Practica este movimiento.'
    },
    {
        id: 'chord-c-major',
        title: 'Acorde de Do Mayor',
        level: 'intermediate',
        category: 'Acordes',
        description: 'Aprende tu primer acorde: Do Mayor (Do-Mi-Sol). Los acordes son la base de la armonía.',
        instructions: 'Toca las notas del acorde de Do Mayor una por una: Do, Mi, Sol. Luego repite. En un piano real, se tocan simultáneamente.',
        sequence: [
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'C', octave: 4 },
        ],
        tips: 'Un acorde mayor se forma con: fundamental + 3ra mayor + 5ta justa (4 semitonos + 3 semitonos).'
    },
    {
        id: 'chord-progression-I-IV-V',
        title: 'Progresión I-IV-V en Do',
        level: 'intermediate',
        category: 'Acordes',
        description: 'La progresión más importante en música: I (Do), IV (Fa), V (Sol), I (Do).',
        instructions: 'Toca los acordes arpegiados (una nota a la vez): Do Mayor, Fa Mayor, Sol Mayor, Do Mayor.',
        sequence: [
            // C major arpeggio
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },
            // F major arpeggio
            { note: 'F', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'C', octave: 5 },
            // G major arpeggio
            { note: 'G', octave: 4 },
            { note: 'B', octave: 4 },
            { note: 'D', octave: 5 },
            // Back to C
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },
        ],
        tips: 'Esta progresión I-IV-V es la base de miles de canciones pop, rock, blues y clásicas.'
    },

    // === ADVANCED ===
    {
        id: 'scale-d-major',
        title: 'Escala de Re Mayor',
        level: 'advanced',
        category: 'Escalas',
        description: 'Re Mayor tiene dos sostenidos: Fa# y Do#. Practica escalas con múltiples alteraciones.',
        instructions: 'Toca Re-Mi-Fa#-Sol-La-Si-Do#-Re y vuelve.',
        sequence: [
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F#', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'B', octave: 4 },
            { note: 'C#', octave: 5 },
            { note: 'D', octave: 5 },
            { note: 'C#', octave: 5 },
            { note: 'B', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'F#', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
        ],
        tips: 'En Re Mayor la digitación es: 1-2-3-1-2-3-4-5. El pulgar pasa debajo después de Fa#.'
    },
    {
        id: 'scale-a-minor',
        title: 'Escala de La Menor Natural',
        level: 'advanced',
        category: 'Escalas',
        description: 'La escala menor natural: La-Si-Do-Re-Mi-Fa-Sol-La. La relativa menor de Do Mayor.',
        instructions: 'Toca La menor subiendo y bajando. Nota el sonido más "triste" comparado con Do Mayor.',
        sequence: [
            { note: 'A', octave: 3 },
            { note: 'B', octave: 3 },
            { note: 'C', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'A', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'E', octave: 4 },
            { note: 'D', octave: 4 },
            { note: 'C', octave: 4 },
            { note: 'B', octave: 3 },
            { note: 'A', octave: 3 },
        ],
        tips: 'La menor y Do Mayor comparten las mismas notas, pero empezando desde La el carácter es completamente diferente.'
    },
    {
        id: 'chord-minor',
        title: 'Acordes Menores: Am, Dm, Em',
        level: 'advanced',
        category: 'Acordes',
        description: 'Aprende los tres acordes menores principales y cómo suenan comparados con los mayores.',
        instructions: 'Toca los arpegios de La menor (La-Do-Mi), Re menor (Re-Fa-La) y Mi menor (Mi-Sol-Si).',
        sequence: [
            // Am
            { note: 'A', octave: 3 },
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
            // Dm
            { note: 'D', octave: 4 },
            { note: 'F', octave: 4 },
            { note: 'A', octave: 4 },
            // Em
            { note: 'E', octave: 4 },
            { note: 'G', octave: 4 },
            { note: 'B', octave: 4 },
            // Back to Am
            { note: 'A', octave: 3 },
            { note: 'C', octave: 4 },
            { note: 'E', octave: 4 },
        ],
        tips: 'Un acorde menor se forma con: fundamental + 3ra menor + 5ta justa (3 semitonos + 4 semitonos).'
    },
];

/**
 * LessonEngine - Manages lesson playback and real-time correction
 */
class LessonEngine {
    constructor() {
        this.currentLesson = null;
        this.currentIndex = 0;
        this.isActive = false;
        this.score = { correct: 0, wrong: 0, streak: 0, maxStreak: 0 };
        this.startTime = null;

        // Callbacks
        this.onNoteExpected = null;
        this.onNoteResult = null;
        this.onLessonComplete = null;
        this.onProgressUpdate = null;

        // Debounce: avoid counting rapid detections as multiple inputs
        this.lastNoteTime = 0;
        this.debounceMs = 250;

        // Tolerance: allow same note in adjacent octaves for beginners
        this.octaveTolerance = false;
    }

    /**
     * Start a lesson
     */
    start(lesson) {
        this.currentLesson = lesson;
        this.currentIndex = 0;
        this.isActive = true;
        this.score = { correct: 0, wrong: 0, streak: 0, maxStreak: 0 };
        this.startTime = Date.now();

        this.emitExpected();
    }

    /**
     * Process a detected note
     */
    processNote(detectedNote, detectedOctave) {
        if (!this.isActive || !this.currentLesson) return;

        // Debounce
        const now = Date.now();
        if (now - this.lastNoteTime < this.debounceMs) return;
        this.lastNoteTime = now;

        const expected = this.currentLesson.sequence[this.currentIndex];
        if (!expected) return;

        // Check if note matches
        const noteMatch = PitchDetector.notesMatch(detectedNote, expected.note);
        const octaveMatch = detectedOctave === expected.octave;
        const isCorrect = noteMatch && (octaveMatch || this.octaveTolerance);

        if (isCorrect) {
            this.score.correct++;
            this.score.streak++;
            if (this.score.streak > this.score.maxStreak) {
                this.score.maxStreak = this.score.streak;
            }
        } else {
            this.score.wrong++;
            this.score.streak = 0;
        }

        // Emit result
        if (this.onNoteResult) {
            this.onNoteResult({
                expected: expected,
                detected: { note: detectedNote, octave: detectedOctave },
                isCorrect: isCorrect,
                index: this.currentIndex,
                score: { ...this.score }
            });
        }

        // Move to next note if correct
        if (isCorrect) {
            this.currentIndex++;
            const progress = this.currentIndex / this.currentLesson.sequence.length;

            if (this.onProgressUpdate) {
                this.onProgressUpdate(progress);
            }

            // Check if lesson complete
            if (this.currentIndex >= this.currentLesson.sequence.length) {
                this.complete();
            } else {
                this.emitExpected();
            }
        }
    }

    /**
     * Emit the currently expected note
     */
    emitExpected() {
        if (this.onNoteExpected && this.currentLesson) {
            const expected = this.currentLesson.sequence[this.currentIndex];
            if (expected) {
                this.onNoteExpected({
                    ...expected,
                    index: this.currentIndex,
                    total: this.currentLesson.sequence.length
                });
            }
        }
    }

    /**
     * Complete the lesson
     */
    complete() {
        this.isActive = false;
        const duration = Date.now() - this.startTime;
        const totalNotes = this.currentLesson.sequence.length;
        const accuracy = Math.round((this.score.correct / (this.score.correct + this.score.wrong)) * 100);

        if (this.onLessonComplete) {
            this.onLessonComplete({
                lesson: this.currentLesson,
                score: this.score,
                accuracy: accuracy,
                duration: duration,
                totalNotes: totalNotes
            });
        }

        // Save progress
        this.saveProgress(this.currentLesson.id, accuracy);
    }

    /**
     * Reset the lesson
     */
    reset() {
        this.currentIndex = 0;
        this.score = { correct: 0, wrong: 0, streak: 0, maxStreak: 0 };
        this.startTime = Date.now();
        this.isActive = true;
        this.emitExpected();
    }

    /**
     * Stop the lesson
     */
    stop() {
        this.isActive = false;
        this.currentLesson = null;
    }

    /**
     * Save progress to localStorage
     */
    saveProgress(lessonId, accuracy) {
        const progress = JSON.parse(localStorage.getItem('pianomaster-progress') || '{}');
        const existing = progress[lessonId] || {};
        progress[lessonId] = {
            completed: true,
            bestAccuracy: Math.max(accuracy, existing.bestAccuracy || 0),
            attempts: (existing.attempts || 0) + 1,
            lastPlayed: Date.now()
        };
        localStorage.setItem('pianomaster-progress', JSON.stringify(progress));
    }

    /**
     * Get saved progress
     */
    static getProgress() {
        return JSON.parse(localStorage.getItem('pianomaster-progress') || '{}');
    }
}
