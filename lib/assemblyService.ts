'use client';

// lib/assemblyService.ts
import { RealtimeTranscriber, RealtimeTranscript } from 'assemblyai';

export class AssemblyService {
  private transcriber: RealtimeTranscriber | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private readonly SAMPLE_RATE = 16000;
  private isProcessing = false;
  private audioDataCounter = 0;

  private async getToken(): Promise<string> {
    console.log('🎫 Requesting temporary token from server...');
    try {
      const response = await fetch('/api/assembly-token');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch token: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log('✅ Token received successfully');
      return data.token;
    } catch (error) {
      console.error('❌ Failed to get AssemblyAI token:', error);
      throw error;
    }
  }

  async startTranscription(
    onPartialTranscript: (text: string) => void,
    onFinalTranscript: (text: string) => void,
    onError: (error: Error) => void
  ) {
    console.log('🎤 Starting transcription service...');
    try {
      // Get token first
      const token = await this.getToken();

      console.log('🔧 Initializing transcriber with configuration...');
      // Initialize transcriber
      this.transcriber = new RealtimeTranscriber({
        token,
        sampleRate: this.SAMPLE_RATE,
      });

      console.log('📡 Setting up event handlers...');
      // Set up event handlers
      this.transcriber.on('open', ({ sessionId }) => {
        console.log(`🟢 WebSocket session opened with ID: ${sessionId}`);
      });

      this.transcriber.on('error', (error: Error) => {
        console.error('🔴 Transcriber error:', error);
        onError(error);
      });

      this.transcriber.on('close', (code: number, reason: string) => {
        console.log(
          `🔵 WebSocket session closed - Code: ${code}, Reason: ${reason}`
        );
      });

      this.transcriber.on('transcript', (transcript: RealtimeTranscript) => {
        if (!transcript.text) return;

        if (transcript.message_type === 'FinalTranscript') {
          console.log('📝 Final transcript:', transcript.text);
          onFinalTranscript(transcript.text);
        } else {
          console.log('✏️ Partial transcript:', transcript.text);
          onPartialTranscript(transcript.text);
        }
      });

      console.log('🔄 Connecting to AssemblyAI WebSocket service...');
      await this.transcriber.connect();

      console.log('🎙️ Initializing audio recording...');
      // Initialize audio context and get microphone stream
      this.audioContext = new AudioContext({
        sampleRate: this.SAMPLE_RATE,
      });

      console.log('🎯 Requesting microphone access...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      console.log('✅ Microphone access granted');

      // Create audio source
      console.log('🔊 Setting up audio processing pipeline...');
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );

      // Create processor node for raw PCM data
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.isProcessing = true;
      this.audioDataCounter = 0;

      // Process audio data
      this.processorNode.onaudioprocess = (e) => {
        if (this.transcriber && this.isProcessing) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32Array to Int16Array for LPCM format
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
          }

          this.audioDataCounter++;
          if (this.audioDataCounter % 10 === 0) {
            console.log(`🔉 Processed ${this.audioDataCounter} audio chunks`);
          }

          // Send audio buffer to transcriber
          this.transcriber.sendAudio(pcmData.buffer);
        }
      };

      // Connect the nodes
      console.log('🔌 Connecting audio nodes...');
      this.mediaStreamSource.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      console.log('✨ Transcription service started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in transcription setup:', error);
      onError(error as Error);
      return false;
    }
  }

  async stopTranscription() {
    console.log('🛑 Stopping transcription service...');
    try {
      // Stop audio processing first
      this.isProcessing = false;
      console.log(
        `ℹ️ Processed total of ${this.audioDataCounter} audio chunks`
      );

      if (this.processorNode) {
        console.log('🔌 Disconnecting audio processor...');
        this.processorNode.disconnect();
        this.processorNode = null;
      }

      if (this.mediaStreamSource) {
        console.log('🔌 Disconnecting media source...');
        this.mediaStreamSource.disconnect();
        this.mediaStreamSource = null;
      }

      if (this.mediaStream) {
        console.log('🎤 Stopping media tracks...');
        const tracks = this.mediaStream.getTracks();
        tracks.forEach((track, index) => {
          console.log(`📍 Stopping track ${index + 1}/${tracks.length}`);
          track.stop();
        });
        this.mediaStream = null;
      }

      if (this.audioContext) {
        console.log('🔊 Closing audio context...');
        await this.audioContext.close();
        this.audioContext = null;
      }

      if (this.transcriber) {
        console.log('🔄 Closing WebSocket connection...');
        await this.transcriber.close();
        this.transcriber = null;
      }

      console.log('✅ Transcription service stopped successfully');
      return true;
    } catch (error) {
      console.error('❌ Error stopping transcription:', error);
      return false;
    }
  }
}

export const assemblyService = new AssemblyService();
