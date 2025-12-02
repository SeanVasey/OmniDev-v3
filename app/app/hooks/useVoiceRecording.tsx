'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if Speech Recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptPiece + ' ';
            } else {
              interim += transcriptPiece;
            }
          }

          if (final) {
            setTranscript((prev) => prev + final);
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);

          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied', {
              description: 'Please allow microphone access in your browser settings',
            });
          } else if (event.error === 'no-speech') {
            toast.warning('No speech detected', {
              description: 'Please try speaking again',
            });
          } else if (event.error === 'network') {
            toast.error('Network error', {
              description: 'Please check your internet connection',
            });
          } else {
            toast.error('Speech recognition error', {
              description: event.message || event.error,
            });
          }

          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
          setInterimTranscript('');
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(() => {
    if (!isSupported) {
      toast.error('Speech recognition not supported', {
        description: 'Your browser does not support speech recognition',
      });
      return;
    }

    if (!recognitionRef.current) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      toast.info('Listening...', {
        description: 'Speak now',
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Failed to start recording');
    }
  }, [isSupported]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      toast.success('Recording stopped');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  /**
   * Cancel recording
   */
  const cancelRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.abort();
      setTranscript('');
      setInterimTranscript('');
      setIsRecording(false);
      toast.info('Recording cancelled');
    } catch (error) {
      console.error('Error cancelling recognition:', error);
    }
  }, []);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Get full transcript including interim
   */
  const getFullTranscript = useCallback(() => {
    return (transcript + ' ' + interimTranscript).trim();
  }, [transcript, interimTranscript]);

  return {
    isRecording,
    transcript,
    interimTranscript,
    fullTranscript: getFullTranscript(),
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript,
  };
}
