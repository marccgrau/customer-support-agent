interface ConversationMessage {
  id: string;
  timestamp: number;
  text: string;
  speakerId: string;
  type: 'user' | 'system';
}

interface SuggestionMessage {
  id: string;
  timestamp: number;
  response: ApiResponse;
}

interface MessageHistory {
  conversations: ConversationMessage[];
  suggestions: SuggestionMessage[];
}

interface ApiResponse {
  id: string;
  response: string;
  thinking: string;
  user_mood:
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'curious'
    | 'frustrated'
    | 'confused';
  suggested_questions: string[];
  debug: {
    context_used: boolean;
  };
  matched_categories?: string[];
  redirect_to_agent?: {
    should_redirect: boolean;
    reason?: string;
  };
}

// Mock conversation history
export const mockMessageHistory: MessageHistory = {
  conversations: [
    {
      id: '1',
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      text: "I've been having trouble accessing my online banking account for the past two days.",
      speakerId: 'Customer',
      type: 'user',
    },
    {
      id: '2',
      timestamp: Date.now() - 1000 * 60 * 4.5, // 4.5 minutes ago
      text: "I understand you're having trouble accessing your online banking. Have you received any error messages when trying to log in?",
      speakerId: 'Agent',
      type: 'system',
    },
    {
      id: '3',
      timestamp: Date.now() - 1000 * 60 * 4, // 4 minutes ago
      text: "Yes, it says 'Invalid credentials' even though I'm sure I'm using the right password. I've tried resetting it twice already.",
      speakerId: 'Customer',
      type: 'user',
    },
    {
      id: '4',
      timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
      text: "I can see that there have been multiple failed login attempts from your account. For security reasons, we'll need to verify your identity before proceeding.",
      speakerId: 'Agent',
      type: 'system',
    },
    {
      id: '5',
      timestamp: Date.now() - 1000 * 60 * 1.5, // 1.5 minutes ago
      text: "Okay, that's fine. What do I need to do?",
      speakerId: 'Customer',
      type: 'user',
    },
  ],
  suggestions: [
    {
      id: 'sugg-1',
      timestamp: Date.now() - 1000 * 60 * 5,
      response: {
        id: 'resp-1',
        response:
          'Initial login issue reported. Recommended steps:\n1. Ask about specific error messages\n2. Check recent login attempt history\n3. Verify if customer has tried password reset\n4. Consider potential security triggers',
        thinking:
          'Customer is reporting access issues which could be security-related. Need to gather more information while being mindful of potential fraud scenarios.',
        user_mood: 'frustrated',
        suggested_questions: [
          'What error message are you seeing when trying to log in?',
          'Have you made any recent changes to your account settings?',
          'Are you able to access your account through our mobile app?',
        ],
        debug: { context_used: true },
        matched_categories: ['account', 'technical'],
      },
    },
    {
      id: 'sugg-2',
      timestamp: Date.now() - 1000 * 60 * 4,
      response: {
        id: 'resp-2',
        response:
          'Multiple failed password resets indicate potential security issue. Actions needed:\n1. Perform full identity verification\n2. Check for suspicious activities\n3. Consider implementing temporary security hold\n4. Prepare account recovery documentation',
        thinking:
          'Multiple password reset attempts combined with login failures suggest either a security issue or potential user error. Need to proceed with caution.',
        user_mood: 'frustrated',
        suggested_questions: [
          'Can you confirm the last successful login to your account?',
          'Have you noticed any unauthorized transactions?',
          'Are you using the same device as usual to access your account?',
        ],
        debug: { context_used: true },
        matched_categories: ['security', 'account'],
        redirect_to_agent: {
          should_redirect: true,
          reason:
            'Multiple failed login attempts require elevated security verification',
        },
      },
    },
    {
      id: 'sugg-3',
      timestamp: Date.now() - 1000 * 60 * 1.5,
      response: {
        id: 'resp-3',
        response:
          'Customer ready for verification. Proceed with:\n1. Two-factor authentication setup\n2. Identity verification questions\n3. Account activity review\n4. Security preferences update',
        thinking:
          'Customer is cooperative and ready for identity verification. Opportunity to enhance account security while resolving the issue.',
        user_mood: 'neutral',
        suggested_questions: [
          'Would you prefer to verify your identity through SMS or email?',
          'Do you have your account statement from last month available?',
          'Would you like to set up additional security measures once we resolve this?',
        ],
        debug: { context_used: true },
        matched_categories: ['security', 'account_recovery'],
      },
    },
  ],
};

// Helper function to format date/time
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
