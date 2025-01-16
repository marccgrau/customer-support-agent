'use client';

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig | null = null;
  private audioConfig: sdk.AudioConfig | null = null;
  private recognizer: sdk.SpeechRecognizer | null = null;
  private isListening: boolean = false;

  async initialize() {
    try {
      // Get credentials from environment variables
      const response = await fetch('/api/speech-token');
      const { token, region } = await response.json();

      if (!token || !region) {
        throw new Error('No speech token or region available');
      }

      console.log('🔑 Initializing Azure Speech Service...');
      this.speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
        token,
        region
      );
      this.speechConfig.speechRecognitionLanguage = 'en-US';

      // Enable speaker diarization
      this.speechConfig.setServiceProperty(
        'speechcontext-phraseDetection-enabled',
        'true',
        sdk.ServicePropertyChannel.UriQueryParameter
      );

      this.speechConfig.setServiceProperty(
        'speechcontext-phraselist-phrases',
        'phrase1,phrase2',
        sdk.ServicePropertyChannel.UriQueryParameter
      );

      console.log('✅ Speech Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing speech service:', error);
      throw error;
    }
  }

  async startTranscription(
    onRecognizing: (text: string) => void,
    onRecognized: (text: string, speakerId: string) => void,
    onError: (error: Error) => void
  ) {
    try {
      if (!this.speechConfig) {
        await this.initialize();
      }

      console.log('🎤 Setting up audio configuration...');
      this.audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      console.log('👥 Creating conversation transcriber...');
      this.recognizer = new sdk.SpeechRecognizer(
        this.speechConfig!,
        this.audioConfig
      );

      // Set up event handlers
      this.recognizer.recognizing = (s, e) => {
        console.log('🔄 Recognizing:', e.result.text);
        onRecognizing(e.result.text);
      };

      this.recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          console.log(
            '✅ Recognized:',
            e.result.text,
            'Speaker:',
            e.result.speakerId
          );
          onRecognized(e.result.text, e.result.speakerId || 'Unknown');
        } else {
          console.log('❌ No match:', e.result.reason);
        }
      };

      this.recognizer.canceled = (s, e) => {
        console.log('❌ Canceled:', e.reason);
        if (e.reason === sdk.CancellationReason.Error) {
          console.error('Error details:', e.errorDetails);
          onError(new Error(e.errorDetails));
        }
      };

      this.recognizer.sessionStopped = (s, e) => {
        console.log('⏹️ Session stopped');
        this.stopTranscription();
      };

      console.log('🎯 Starting continuous recognition...');
      await this.recognizer.startContinuousRecognitionAsync();
      this.isListening = true;
      console.log('✅ Transcription started');
      return true;
    } catch (error) {
      console.error('❌ Error starting transcription:', error);
      onError(error as Error);
      return false;
    }
  }

  async stopTranscription() {
    try {
      console.log('⏹️ Stopping transcription...');

      if (this.recognizer) {
        await this.recognizer.stopContinuousRecognitionAsync();
        this.recognizer = null;
      }

      if (this.audioConfig) {
        this.audioConfig = null;
      }

      this.isListening = false;
      console.log('✅ Transcription stopped');
      return true;
    } catch (error) {
      console.error('❌ Error stopping transcription:', error);
      return false;
    }
  }
}

export const azureSpeechService = new AzureSpeechService();
