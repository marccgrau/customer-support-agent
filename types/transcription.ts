export interface TranscribedSegment {
  text: string;
  timestamp: number;
  isPartial: boolean;
  speakerId: string;
}
