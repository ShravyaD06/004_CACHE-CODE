/**
 * Voice Service for DocuSense AI
 * Provides premium Text-to-Speech (TTS) response playback
 * and Speech-to-Text (STT) voice command recognition using Web Speech APIs.
 */

export interface VoiceOptions {
  rate?: number; // 0.8 to 1.5
  pitch?: number; // 0.8 to 1.2
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isCurrentlySpeaking: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private recognition: any = null;
  private isListeningActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prefer English voices with natural/enhanced sounding names
    const preferred = this.voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Jenny') ||
          v.name.includes('Aria') ||
          v.name.includes('Guy') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('David'))
    );
    this.selectedVoice = preferred || this.voices.find((v) => v.lang.startsWith('en')) || this.voices[0] || null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.voices.length && this.synth) {
      this.loadVoices();
    }
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  public setVoiceByName(name: string) {
    const found = this.voices.find((v) => v.name === name);
    if (found) {
      this.selectedVoice = found;
    }
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  /**
   * Sanitizes markdown, technical jargon, and table formatting
   * to ensure speech sounds conversational, fluent, and natural.
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';

    let clean = text
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove image and link tags [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove header hashtags
      .replace(/#{1,6}\s+/g, '')
      // Remove blockquote arrows
      .replace(/^\s*>\s+/gm, '')
      // Remove horizontal rules
      .replace(/---+/g, '')
      // Format bullet lists to natural conversational pauses
      .replace(/^\s*[\*\-]\s+/gm, '. ')
      .replace(/^\s*\d+\.\s+/gm, '. ')
      // Remove table pipes
      .replace(/\|/g, ', ')
      // Clean up markdown bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Replace snake_case fields with natural space (e.g. invoice_number -> invoice number)
      .replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g, '$1 $2')
      // Currency expansion
      .replace(/\$([0-9]+(?:\.[0-9]+)?)/g, '$1 dollars')
      .replace(/€([0-9]+(?:\.[0-9]+)?)/g, '$1 euros')
      .replace(/£([0-9]+(?:\.[0-9]+)?)/g, '$1 pounds')
      .replace(/₹([0-9]+(?:\.[0-9]+)?)/g, '$1 rupees')
      .replace(/%/g, ' percent ')
      .replace(/&/g, ' and ')
      // Clean multiple spaces and newlines
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    return clean;
  }

  /**
   * Splits long text into natural sentence-length chunks (<= 150 chars).
   * This bypasses the Chrome / Edge SpeechSynthesis 15-second cutoff bug.
   */
  private splitIntoChunks(text: string): string[] {
    const rawSentences = text.split(/(?<=[.?!;:])\s+/);
    const chunks: string[] = [];

    for (const sentence of rawSentences) {
      if (!sentence.trim()) continue;
      if (sentence.length <= 150) {
        chunks.push(sentence.trim());
      } else {
        // Split further by commas or word count
        const subParts = sentence.split(/,\s+/);
        let temp = '';
        for (const sub of subParts) {
          if ((temp + ', ' + sub).length <= 150) {
            temp = temp ? `${temp}, ${sub}` : sub;
          } else {
            if (temp) chunks.push(temp.trim());
            temp = sub;
          }
        }
        if (temp) chunks.push(temp.trim());
      }
    }
    return chunks;
  }

  /**
   * Speak the given text using Web Speech API synthesis.
   */
  public speak(rawText: string, options: VoiceOptions = {}) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Stop any existing speech playback
    this.stop();

    const clean = this.cleanTextForSpeech(rawText);
    if (!clean) return;

    const chunks = this.splitIntoChunks(clean);
    if (chunks.length === 0) return;

    this.isCurrentlySpeaking = true;
    if (options.onStart) options.onStart();

    // Prepare speech queue
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (!this.isCurrentlySpeaking || chunkIndex >= chunks.length) {
        this.isCurrentlySpeaking = false;
        if (options.onEnd) options.onEnd();
        return;
      }

      const chunkText = chunks[chunkIndex];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      
      utterance.voice = options.voiceName 
        ? (this.voices.find((v) => v.name === options.voiceName) || this.selectedVoice)
        : this.selectedVoice;

      utterance.rate = options.rate || 1.05; // slightly swift, natural enterprise assistant pace
      utterance.pitch = options.pitch || 1.0;

      utterance.onend = () => {
        chunkIndex++;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are standard when user clicks stop
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis utterance error:', e);
          if (options.onError) options.onError(e);
        }
        this.isCurrentlySpeaking = false;
      };

      this.synth?.speak(utterance);
    };

    speakNextChunk();
  }

  /**
   * Immediately stops any speech currently in progress.
   */
  public stop() {
    this.isCurrentlySpeaking = false;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Ignore synthesis cancel errors
      }
    }
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  /**
   * Starts speech-to-text recognition through the microphone.
   */
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser environment.');
      return false;
    }

    try {
      this.stopListening();

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        this.isListeningActive = true;
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, !!finalTranscript);
      };

      rec.onerror = (event: any) => {
        this.isListeningActive = false;
        if (onError) onError(event);
      };

      rec.onend = () => {
        this.isListeningActive = false;
        if (onEnd) onEnd();
      };

      rec.start();
      this.recognition = rec;
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (onError) onError(err);
      return false;
    }
  }

  public stopListening() {
    this.isListeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.recognition = null;
    }
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

export const voiceService = new VoiceService();
