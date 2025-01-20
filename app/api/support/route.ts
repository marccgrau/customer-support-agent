import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { retrieveContext, RAGSource } from '@/app/lib/utils';
import crypto from 'crypto';
import customerSupportCategories from '@/app/lib/customer_support_categories.json';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Debug message helper function
// Input: message string and optional data object
// Output: JSON string with message, sanitized data, and timestamp
const debugMessage = (msg: string, data: any = {}) => {
  console.log(msg, data);
  const timestamp = new Date().toISOString().replace(/[^\x20-\x7E]/g, '');
  const safeData = JSON.parse(JSON.stringify(data));
  return JSON.stringify({ msg, data: safeData, timestamp });
};

// Define the schema for the AI response using Zod
// This ensures type safety and validation for the AI's output
const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum([
    'positive',
    'neutral',
    'negative',
    'curious',
    'frustrated',
    'confused',
  ]),
  suggested_questions: z.array(z.string()),
  debug: z.object({
    context_used: z.boolean(),
  }),
  matched_categories: z.array(z.string()).optional(),
  redirect_to_agent: z
    .object({
      should_redirect: z.boolean(),
      reason: z.string().optional(),
    })
    .optional(),
});

// Helper function to sanitize header values
// Input: string value
// Output: sanitized string (ASCII characters only)
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[^\x00-\x7F]/g, '');
}

// Helper function to log timestamps for performance measurement
// Input: label string and start time
// Output: Logs the duration for the labeled operation
const logTimestamp = (label: string, start: number) => {
  const timestamp = new Date().toISOString();
  const time = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`⏱️ [${timestamp}] ${label}: ${time}s`);
};

// Main POST request handler
export async function POST(req: Request) {
  const apiStart = performance.now();
  const measureTime = (label: string) => logTimestamp(label, apiStart);

  // Extract data from the request body
  const { messages, model, knowledgeBaseId } = await req.json();
  const latestMessage = messages[messages.length - 1].content;

  console.log('📝 Latest Query:', latestMessage);
  measureTime('User Input Received');

  // Prepare debug data
  const MAX_DEBUG_LENGTH = 1000;
  const debugData = sanitizeHeaderValue(
    debugMessage('🚀 API route called', {
      messagesReceived: messages.length,
      latestMessageLength: latestMessage.length,
      anthropicKeySlice: process.env.ANTHROPIC_API_KEY?.slice(0, 4) + '****',
    })
  ).slice(0, MAX_DEBUG_LENGTH);

  // Initialize variables for RAG retrieval
  let retrievedContext = '';
  let isRagWorking = false;
  let ragSources: RAGSource[] = [];

  // Attempt to retrieve context from RAG
  try {
    console.log('🔍 Initiating RAG retrieval for query:', latestMessage);
    measureTime('RAG Start');
    const result = await retrieveContext(latestMessage, knowledgeBaseId);
    retrievedContext = result.context;
    isRagWorking = result.isRagWorking;
    ragSources = result.ragSources || [];

    if (!result.isRagWorking) {
      console.warn('🚨 RAG Retrieval failed but did not throw!');
    }

    measureTime('RAG Complete');
    console.log('🔍 RAG Retrieved:', isRagWorking ? 'YES' : 'NO');
    console.log(
      '✅ RAG retrieval completed successfully. Context:',
      retrievedContext.slice(0, 100) + '...'
    );
  } catch (error) {
    console.error('💀 RAG Error:', error);
    console.error('❌ RAG retrieval failed for query:', latestMessage);
    retrievedContext = '';
    isRagWorking = false;
    ragSources = [];
  }

  measureTime('RAG Total Duration');

  // Prepare categories context for the system prompt
  const USE_CATEGORIES = true;
  const categoryListString = customerSupportCategories.categories
    .map((c) => c.id)
    .join(', ');

  const categoriesContext = USE_CATEGORIES
    ? `
    To help with our internal classification of inquries, we would like you to categorize inquiries in addition to support in answering them.
    We have provided you with ${customerSupportCategories.categories.length} customer support categories.
    Check if your support action fits into any category and include the category IDs in your "matched_categories" array.
    The available categories are: ${categoryListString}
    If multiple categories match, include multiple category IDs. If no categories match, return an empty array.
  `
    : '';

  // Change the system prompt company for your use case
  const systemPrompt = `You are acting as an assistant to a customer service agent who is interacting with a customer.
  Your goal is to assist the customer service agent by providing essential next steps and relevant information to satisfy the customer's request.
  You do not answer to the agent directly but just provide hints or information based on the ongoing conversation between the customer service agent and the customer.
  Aim to provide concise and helpful guidance while maintaining a professional tone.

  To help you support the customer service agent in addressing the customer's question, we have retrieved the following information for you.
  It may or may not be relevant (we are using a RAG pipeline to retrieve this information):
  ${
    isRagWorking
      ? `${retrievedContext}`
      : 'No information found for this query.'
  }

  Please provide suggestions that only use the information you have been given.
  If no information is available or if the information is not relevant for answering the question, try to provide general guidance based on the context of the conversation.

  ${categoriesContext}

  If the customer's question is unrelated to our products and services, you should inform the customer service agent accordingly.

  You are assisting the customer service agent in resolving the customer's issue by providing essential next steps and relevant information. 
  Your goal is to help the agent satisfy the customer's request efficiently.

  To display your responses correctly, you must format your entire response as a valid JSON object with the following structure:
  {
      "thinking": "Brief explanation of your reasoning for how you should address the customer's query",
      "response": "Your concise guidance to the customer service agent",
      "user_mood": "positive|neutral|negative|curious|frustrated|confused",
      "suggested_questions": ["Question 1?", "Question 2?", "Question 3?"],
      "debug": {
        "context_used": true|false
      },
      ${
        USE_CATEGORIES
          ? '"matched_categories": ["category_id1", "category_id2"],'
          : ''
      }
      "redirect_to_agent": {
        "should_redirect": boolean,
        "reason": "Reason for redirection (optional, include only if should_redirect is true)"
      }
    }

  Here are a few examples of how your response should look:

  **Example of a response without redirection:**
  {
    "thinking": "Providing relevant information from the knowledge base to assist the agent",
    "response": "Advise the customer to update their account settings by following these steps...",
    "user_mood": "curious",
    "suggested_questions": ["Would the customer like assistance with payment options?", "Does the customer need help with account recovery?"],
    "debug": {
      "context_used": true
    },
    "matched_categories": ["account_management", "billing"],
    "redirect_to_agent": {
      "should_redirect": false
    }
  }

  **Example of a response with suggestion to escalate the issue:**
  {
    "thinking": "The customer's request requires specialized assistance",
    "response": "Recommend escalating the issue to the technical support team due to its complexity.",
    "user_mood": "frustrated",
    "suggested_questions": [],
    "debug": {
      "context_used": false
    },
    "matched_categories": ["technical_support"],
    "redirect_to_agent": {
      "should_redirect": true,
      "reason": "Issue requires specialized technical support"
    }
  }
  `;

  function sanitizeAndParseJSON(jsonString: string) {
    // Replace newlines within string values
    const sanitized = jsonString.replace(/(?<=:\s*")(.|\n)*?(?=")/g, (match) =>
      match.replace(/\n/g, '\\n')
    );

    try {
      return JSON.parse(sanitized);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }
  }

  try {
    console.log(`🚀 Query Processing`);
    measureTime('Claude Generation Start');

    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    anthropicMessages.push({
      role: 'assistant',
      content: '{',
    });

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      messages: anthropicMessages,
      system: systemPrompt,
      temperature: 0.3,
    });

    measureTime('Claude Generation Complete');
    console.log('✅ Message generation completed');

    // Extract text content from the response
    const textContent =
      '{' +
      response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join(' ');

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = sanitizeAndParseJSON(textContent);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    const validatedResponse = responseSchema.parse(parsedResponse);

    const responseWithId = {
      id: crypto.randomUUID(),
      ...validatedResponse,
    };

    // Check if redirection to a human agent is needed
    if (responseWithId.redirect_to_agent?.should_redirect) {
      console.log('🚨 AGENT REDIRECT TRIGGERED!');
      console.log('Reason:', responseWithId.redirect_to_agent.reason);
    }

    // Prepare the response object
    const apiResponse = new Response(JSON.stringify(responseWithId), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add RAG sources to the response headers if available
    if (ragSources.length > 0) {
      apiResponse.headers.set(
        'x-rag-sources',
        sanitizeHeaderValue(JSON.stringify(ragSources))
      );
    }

    // Add debug data to the response headers
    apiResponse.headers.set('X-Debug-Data', sanitizeHeaderValue(debugData));

    measureTime('API Complete');
    console.log('apiResponse:', responseWithId);
    return apiResponse;
  } catch (error) {
    // Handle errors in AI response generation
    console.error('💥 Error in message generation:', error);
    const errorResponse = {
      response:
        'Sorry, there was an issue processing your request. Please try again later.',
      thinking: 'Error occurred during message generation.',
      user_mood: 'neutral',
      debug: { context_used: false },
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
