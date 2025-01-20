import { MessageHistory } from './messages';

export interface SuggestionsCardProps {
  messageHistory: MessageHistory;
  isLoading: boolean;
}

export interface RealtimeAssistantProps {
  selectedKnowledgeBase?: string;
  selectedModel?: string;
}

export interface ConversationCardProps {
  messageHistory: MessageHistory;
  currentTranscript: string;
  isListening: boolean;
  toggleListening: () => Promise<void>;
  isLoading: boolean;
}
