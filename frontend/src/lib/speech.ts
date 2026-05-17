// Speech synthesis and recognition utilities

export function speakText(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = [
            'Google UK English Female',
            'Microsoft Zira',
            'Samantha',
            'Karen',
        ];
        let selectedVoice = null;
        for (const name of preferred) {
            const v = voices.find(v => v.name.includes(name));
            if (v) { selectedVoice = v; break; }
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
                || voices.find(v => v.lang === 'en-US')
                || voices[0];
        }
        if (selectedVoice) utterance.voice = selectedVoice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
    } else {
        window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
}

export type SpeechRecognitionResult = {
    transcript: string;
    confidence: number;
    isFinal: boolean;
};

export function startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd?: () => void
): (() => void) {
    if (typeof window === 'undefined') {
        onError('Not in browser environment');
        return () => { };
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        onError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return () => { };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                finalTranscript += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }

        const transcript = finalTranscript || interimTranscript;
        const confidence = event.results[event.results.length - 1][0].confidence || 0.9;
        const isFinal = event.results[event.results.length - 1].isFinal;

        if (transcript) {
            onResult({ transcript, confidence, isFinal });
        }
    };

    recognition.onerror = (event: any) => {
        // 'aborted' is often a transient error that happens when 
        // starting/stopping recognition too quickly, or if the 
        // browser's audio context is busy.
        if (event.error === 'aborted') {
            console.warn('Speech recognition aborted: transient error.');
            return;
        }

        switch (event.error) {
            case 'not-allowed':
                onError('Microphone access denied. Please allow microphone access in your browser.');
                break;
            case 'no-speech':
                onError('No speech detected. Please speak clearly into your microphone.');
                break;
            case 'network':
                onError('Network error during speech recognition.');
                break;
            default:
                console.error(`Speech recognition error: ${event.error}`);
                onError(`Speech recognition error: ${event.error}`);
        }
    };

    recognition.onend = () => {
        if (onEnd) onEnd();
    };

    recognition.start();

    return () => {
        try {
            recognition.stop();
        } catch (e) { }
    };
}

export function isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
        typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
}

export function isTTSSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
}
