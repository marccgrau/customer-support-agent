import { ApiResponse } from './api';

export interface ConversationMessage {
  id: string;
  timestamp: number;
  text: string;
  speakerId: string;
  type: 'user' | 'system';
}

export interface SuggestionMessage {
  id: string;
  timestamp: number;
  response: ApiResponse;
}

export interface MessageHistory {
  conversations: ConversationMessage[];
  suggestions: SuggestionMessage[];
}
