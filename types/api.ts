export interface ApiResponse {
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
