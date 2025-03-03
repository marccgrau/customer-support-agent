# Claude Customer Support Agent

## Project Overview

Claude Customer Support Agent is an AI-powered customer support chat interface designed to automate and enhance user support interactions. It leverages Anthropic’s Claude large language model along with Amazon Bedrock’s Knowledge Bases to provide informative, context-aware responses to customer queries. The project demonstrates how an intelligent agent can answer common questions, retrieve relevant information from a knowledge base, detect user sentiment, and even escalate conversations to human agents when necessary. Its primary purpose is to serve as a **fully customizable customer support chatbot** that can be adapted to various domains while maintaining helpful and professional assistance to users.

## Pages, Routes, and Layouts

This application is built with Next.js (App Router) and organizes its UI into a main chat page and supporting API routes:

- **Main Chat Page (`/`)** – The root route renders the customer support chat interface. This page includes the conversation area where the user and AI agent exchange messages. The layout is divided into a central chat panel and optional sidebars (left and/or right) based on configuration.
- **Layout Structure** – A global layout (`app/layout.tsx`) wraps the application, applying a consistent structure and theme. It includes the main content area for chat and conditionally renders a left sidebar and right sidebar if enabled. These sidebars can display additional UI elements (such as context info, debugging details, or navigation) as configured.
- **Optional Sidebars** – By default, the chat UI can run in full-width mode or include side panels. The **left sidebar** and **right sidebar** are included or excluded via environment settings (described below). For example, you might use a left sidebar for user profile or navigation, and a right sidebar for showing retrieved knowledge base snippets or the agent’s “thinking” process.
- **API Route** – The Next.js API route `POST /api/chat` is implemented to handle chat interactions on the server side. The front-end calls this endpoint whenever the user sends a message. This route processes the conversation through Claude and returns the AI’s structured response (more details in the API Documentation section). No other pages or routes (like static pages) are present in this project; the focus is on the chat interface and its backend logic.

## Functionalities

This customer support agent comes with several key features and workflows to provide a rich support experience:

- **AI-Powered Chat** – Users can have a conversation with an AI agent powered by Anthropic’s Claude model. The agent is initialized with a support-oriented persona and can handle queries about the company’s products or services, aiming to give concise and helpful answers. Multiple Claude models are supported; developers can switch between model versions (e.g., Claude 3 vs 3.5) via a dropdown in the UI or configuration.

- **Knowledge Base Integration (RAG)** – The agent uses Retrieval-Augmented Generation by integrating with **Amazon Bedrock Knowledge Bases** for context. When a user asks a question, the system will retrieve relevant documents or snippets from a configured knowledge base to help answer the query. These knowledge base entries (e.g. FAQs, manuals) are provided to the AI model as additional context, enabling it to give accurate, specific answers using up-to-date information. The application supports multiple knowledge bases – you can configure an array of knowledge base IDs (with friendly names) in the code, and the user (or developer) can select which knowledge base to use for retrieval.

- **Real-Time “Thinking” & Debug Info Display** – For transparency and debugging, the agent’s reasoning process and debug flags are exposed. With each AI response, Claude returns a short **"thinking"** explanation of how it derived the answer, as well as a debug indicator of whether retrieved context was used. The UI can display this information (for example, in a side panel or alongside the answer) so developers or support staff can see _why_ the bot answered the way it did. This real-time reasoning display helps in verifying that the agent is following instructions and using the knowledge base correctly.

- **Knowledge Base Source Visualization** – The agent not only uses the knowledge base behind the scenes, but also makes it clear when that context is applied. If the retrieval finds relevant info, the chat response will indicate that context was used (and which source, if configured). The system collects the top retrieved documents (with snippet, source ID, etc.) and can present them in the UI for transparency. This means support agents or users can see references or excerpts from the knowledge base that informed the answer, building trust and allowing further reading if needed.

- **User Mood Detection** – Each response includes an analysis of the user’s mood or sentiment (e.g. _positive, neutral, negative, curious, frustrated, confused_). The AI model infers the user’s emotional state from the conversation. This enables the system to adapt its behavior or tone. For instance, if the user appears _frustrated_ or _confused_, the agent can respond with more empathy or simpler explanations.

- **Automatic Agent Redirection (Escalation)** – The agent is designed to know its limitations. If it cannot adequately handle the request or if it detects the user really needs human intervention, it can flag the conversation for escalation. In its response JSON, the field `redirect_to_agent` will indicate if a handoff is recommended. For example, Claude might output `"should_redirect": true` with a reason like “Complex technical issue requiring human expertise”. In the chat UI, this could trigger a message to the user like _"I'll connect you with a human agent for further assistance."_ (and in a real deployment, it could notify a human support agent to join the chat). This feature ensures that unhappy or unresolvable cases are gracefully handed over to a person.

- **Suggested Follow-Up Questions** – To keep the conversation flowing, the AI also provides a few suggested questions related to the topic at hand. These appear as a list of strings (e.g., `"suggested_questions": ["How do I update my account?", "What are the payment options?"]`) in the response. The UI can render these as quick-reply buttons or hints, allowing the user to click a follow-up question instead of typing it. This helps users discover more information and reduces effort in figuring out what to ask next.

- **Highly Customizable UI** – The front-end is built with **shadcn/ui** components (a collection of Radix UI + Tailwind CSS based components), making it easy to restyle or reconfigure the interface. You can modify the UI components in the `components/ui` directory or adjust global styles (Tailwind CSS) to match your branding. The theme is configurable, and even multiple color themes can be defined (the project includes a `themes` configuration where you can tweak light/dark mode colors or add new themes). In short, the look-and-feel and layout can be tailored extensively without changing the core logic.

- **Configurable Layout Modes** – Recognizing that different deployments may require different interface complexities, the project allows enabling or disabling certain UI elements via environment flags. For example, you might want a **full chat** with both sidebars in an internal tool, but a slim **chat-only** widget on a public site. The provided NPM scripts let you run the app in modes like _left-sidebar only_, _right-sidebar only_, or _no sidebars_, by setting the appropriate environment variables behind the scenes. This flexibility lets you experiment with or deploy a pared-down UI easily, without manually removing code.

In summary, the agent provides an interactive chat experience enriched by knowledge retrieval and thoughtful UX features (like reasoning display and suggestions), all configurable to your needs.

## Setup and Running Instructions

To get started with the project on your local machine, follow these steps:

1. **Clone the Repository** – Download the code from the GitHub repository. You can use the command:

   ```bash
   git clone https://github.com/marccgrau/customer-support-agent.git
   ```

   Then change into the project directory:

   ```bash
   cd customer-support-agent
   ```

2. **Install Dependencies** – Ensure you have Node.js (preferably v18+ for Next 14) and npm installed. Install the required Node packages by running:

   ```bash
   npm install
   ```

   This will fetch all dependencies (React, Next.js, Anthropic SDK, AWS SDK, UI libraries, etc.) as listed in `package.json`.

3. **Configure Environment Variables** – The app requires a few API keys to function. Create a file named `.env.local` in the project root (this will be used by Next.js) and add the following variables:

   ```plaintext
   ANTHROPIC_API_KEY=your_anthropic_api_key
   BAWS_ACCESS_KEY_ID=your_aws_access_key_id
   BAWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AZURE_SPEECH_KEY=your_azure_speech_key
   AZURE_SPEECH_REGION=your_azure_speech_region
   NEXT_PUBLIC_INCLUDE_MOCK_MESSAGES=false
   ```

   - **Anthropic API Key**: This is needed to call Claude. Obtain it by signing up at Anthropic and generating an API key from the Anthropic console. Paste the key value after `ANTHROPIC_API_KEY=`.
   - **AWS Credentials**: The app uses Amazon Bedrock’s API, which requires AWS credentials with Bedrock access. You can use an existing AWS Access Key and Secret, or create a new IAM user with the AmazonBedrockFullAccess policy. Put the access key ID in `BAWS_ACCESS_KEY_ID` and secret in `BAWS_SECRET_ACCESS_KEY`. (Note: The prefix “BAWS” is intentional – it stands for Bedrock AWS – to avoid conflict with deployment services that restrict env vars starting with “AWS”.)
   - **Azure Speech Service**: If you plan to use voice input/output, you need to configure Azure Speech Service. Obtain the key and region from the Azure portal and set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` respectively.
   - **(Optional) Knowledge Base ID**: If you have a specific Knowledge Base you want to use by default, you may set an env var (e.g. `KNOWLEDGE_BASE_ID`) and update the code to use it. In this project, knowledge base selection is handled in code rather than via env, so this is optional. By default, you’ll manually configure the knowledge base IDs in the source (see Knowledge Base Setup below).

4. **Knowledge Base Setup** – Before running the app, ensure you have access to Amazon Bedrock and have created a knowledge base:

   - Log in to your AWS account (that has Bedrock access) and navigate to Amazon Bedrock in the AWS Console.
   - Create a Knowledge Base in your desired region and index your documents or FAQs into it (for example, upload PDF manuals or text files to the knowledge base via S3). Note the Knowledge Base ID that gets generated.
   - Open the file `ChatArea.tsx` (under `components/` or `app/` directory) in the project, and find the `knowledgeBases` array definition. By default it contains a placeholder entry:
     ```typescript
     const knowledgeBases: KnowledgeBase[] = [
       { id: 'your-knowledge-base-id', name: 'Your KB Name' },
       // ... you can add more if needed
     ];
     ```
     Replace `"your-knowledge-base-id"` with the ID of your knowledge base, and `"Your KB Name"` with a friendly name to display. If you have multiple knowledge bases, you can list them in this array. This will allow the app to retrieve context from your specific data when answering questions.

5. **Run the Development Server** – Start the Next.js development server by running:

   ```bash
   npm run dev
   ```

   This will launch the app in development mode (by default with both sidebars enabled). The terminal will show a local URL (typically `http://localhost:3000`). Open this URL in your browser. You should see the Customer Support chat interface load. You can now type a message to the AI agent to test the functionality.

6. **Interact with the Chat** – In the web UI, enter queries in the input box at the bottom. For example, “Hello, I need help with resetting my password.” The AI agent will process your query (you might see a brief indication of loading or “thinking”) and then respond with a helpful answer. If you set up the knowledge base with relevant info (e.g., an article about password resets), the bot should pull in that context for a more accurate answer. You can also try selecting a different model (if the UI provides a model selector) or different knowledge base (if multiple are configured) to see how it affects responses.

7. **Build for Production (optional)** – If you want to run a production build or deploy the app, you can build it with `npm run build` and then start the optimized production server with `npm start`. By default, the build and dev scripts will include both sidebars (if not configured otherwise). See below for customization of the build configuration via environment variables or specialized scripts.

Note: The API keys and AWS credentials you put in `.env.local` are sensitive. Do not commit this file to source control or expose it publicly. The app will use these keys server-side to call Anthropic and Bedrock APIs. Also ensure your AWS region in the code matches where your knowledge base resides (the code defaults to `us-east-1` region for Bedrock – update if your knowledge base is in another region).

## API Documentation

The backend of this project is a simple RESTful API (provided by Next.js API routes) that the front-end uses to generate AI responses. All client requests for AI completions go to a single endpoint:

### POST /api/chat

This endpoint handles a user message and returns an AI response (along with additional metadata).

- **Authentication**: There is no user authentication required for this endpoint out-of-the-box (in a real deployment you might secure it). It expects that the server is configured with the necessary API keys via the environment variables described above. When the endpoint calls out to Anthropic or AWS Bedrock, it uses those keys internally – the client never needs to send them.

- **Request Body**: JSON object with the following fields:

  - `model` (string) – The identifier of the Claude model to use for this query. For example `"claude-3-haiku-20240307"` or `"claude-3-5-sonnet-20240620"`. These correspond to Claude model versions; you should use one of the model IDs configured in the application. (If not sure, use the default provided in the code.)
  - `knowledgeBaseId` (string) – The ID of the Knowledge Base to use for retrieval. This should match one of the IDs you configured in the `knowledgeBases` array. The server will use this to fetch relevant context from Amazon Bedrock. If you do not have a knowledge base or want to run the bot without retrieval, you may pass an empty string or omit this (the app will then respond without additional context).
  - `messages` (array of objects) – The conversation history leading up to the latest user query. Each message object should have a role and content. Roles are typically "user" for user messages and "assistant" for AI responses. The content is the text of the message. For example:
    ```json
    {
      "role": "user",
      "content": "How do I update my billing information?"
    }
    ```
    The latest message in this array should be the new user query that the AI needs to answer. Prior messages provide context (conversation memory). On the very first question, this array may contain just one message (the user’s question). The client application manages this message array, including prior Q&A turns, and sends it with each request.

- **Response**: JSON object with the assistant’s answer and metadata. The server generates a structured response containing several fields:
  - `id` (string) – A unique identifier for this answer message, generated by the server (UUID). This can be used by the frontend to track messages.
  - `response` (string) – The main answer text from the AI, intended to be shown to the user. This is the helpful response addressing the user’s query (e.g. an explanation or solution).
  - `thinking` (string) – A brief description of the AI’s reasoning process for this answer. This is not part of the answer to the user, but rather an insight into how the AI decided on the answer. It might say something like “Providing relevant information from the knowledge base” or “User request requires human intervention”. It’s mainly for debugging or transparency.
  - `user_mood` (string) – The sentiment or mood of the user as perceived by the AI. Possible values include "positive", "neutral", "negative", "curious", "frustrated", "confused". This can help in adjusting the support tone.
  - `suggested_questions` (array of strings) – A list of follow-up questions that the AI suggests. These are related to the user’s query and can be offered to the user as quick next options. For example, for a billing question, suggestions might include “How do I update my account profile?”.
  - `debug` (object) – Debugging info. It currently contains a boolean flag `context_used` which is true if the AI’s answer utilized the knowledge base context that was retrieved. If false, it means the agent answered without using the retrieved documents (either none were relevant or it was a straightforward query).
  - `matched_categories` (array of strings) – (Optional) If category classification is enabled, this lists IDs of any support categories that the user’s inquiry was classified under. (By default, the system prompt includes an instruction to classify the query into categories. For example, a billing question might yield ["account_management", "billing"] as categories.) This can be useful for analytics or routing, but it’s primarily an internal feature.
  - `redirect_to_agent` (object) – Indicates if the AI recommends escalating to a human agent. It has two fields:
    - `should_redirect` (boolean) – true if the AI determines the conversation should be handed to a human, otherwise false.
    - `reason` (string, optional) – If a redirect is suggested, this may contain a short reason (e.g. “Complex issue requiring human help”). The reason is provided at the AI’s discretion to explain why it can’t continue.

Example: A successful response without a human handoff might look like:

```json
{
  "id": "d3f1bf29-8c2e-4e1a-9c7b-84f48d6f3c5e",
  "thinking": "Providing relevant information from the knowledge base",
  "response": "Sure! To update your billing information, log in to your account, go to the Billing section, and click 'Update Payment Details.' I've also pulled up an article that walks you through each step.",
  "user_mood": "curious",
  "suggested_questions": [
    "How do I update my account profile?",
    "What payment methods are supported?"
  ],
  "debug": { "context_used": true },
  "matched_categories": ["account_management", "billing"],
  "redirect_to_agent": { "should_redirect": false }
}
```

This indicates the bot answered using the knowledge base (context was used), classified the query into account_management and billing categories, and saw the user as curious but not upset. It provided two follow-up suggestions.

In another scenario, if `should_redirect` is true, the response might be a handoff message (e.g. “I’m connecting you to a human agent…”), and a reason would be included in `redirect_to_agent` to log why the AI decided to escalate.

Processing Details: Under the hood, when this endpoint receives the request, it performs the following:

1. **Retrieve Context (RAG)** – It uses the `knowledgeBaseId` to query Amazon Bedrock’s Knowledge Base for relevant documents matching the latest user question. Up to a few top results are returned. The text from these documents is compiled into a context string, and references (source snippets) are collected.
2. **Construct Prompt** – A system message is constructed that gives Claude instructions (e.g., to act as a support agent, to use the retrieved context, to stay concise, and to output JSON). The retrieved context is embedded into this prompt. If category classification is on, the prompt also provides the list of possible categories.
3. **Call Claude API** – The server sends the conversation (prior messages and system prompt) to the Anthropic Claude API, asking it to complete the assistant’s response in the required JSON format. The selected model ID is used for this request.
4. **Parse Response** – Claude’s answer is expected to be a JSON string. The server parses this JSON and validates it against a schema (ensuring all fields like thinking, response, etc., are present). If parsing fails, an error is returned.
5. **Return JSON** – The cleaned JSON is sent back to the client as the response body, with an HTTP 200 status. Additionally, the server includes two custom headers: `X-Debug-Data` (containing some debug info/timing from the request) and `X-RAG-Sources` (a JSON of the retrieved source snippets). The client can use `X-RAG-Sources` if it wants to display the actual content or titles of the documents that were retrieved.

There are no other public API endpoints in this project. All functionality is encapsulated in the single `/api/chat` route. (If voice input were added, there might be an endpoint like `/api/transcribe` to handle audio, but as of this project version, queries are text-based.)

### Error Handling

If the AI fails to produce a valid JSON (or any error occurs during retrieval or generation), the endpoint will return an error (HTTP 500) with a message. For instance, if the JSON is invalid, you’d get an “Invalid JSON response from AI” error. Make sure your API keys are correct and that your Anthropic account has access to the specified model, and your AWS credentials have Bedrock permissions, to avoid errors.

## Additional Notes

### Technology Stack

This project is built with Next.js 14 (React 18) and TypeScript. It uses Anthropic’s JavaScript SDK (`@anthropic-ai/sdk`) to communicate with Claude, and the AWS SDK for Bedrock Agent (`@aws-sdk/client-bedrock-agent-runtime`) for knowledge base retrieval. The UI is styled with Tailwind CSS and uses shadcn/ui components (which are based on Radix UI primitives) for a modern, accessible design. State management relies on React hooks (e.g., `useState` for messages). There is also integration for Markdown rendering (`react-markdown`) so the AI’s responses can include formatted text if needed (useful for knowledge base content or links).

### Customization and Extensibility

Developers can easily modify the behavior and appearance:

- To adjust the system persona or instructions for the bot, edit the system prompt in the API route (in `app/api/chat/route.ts`). For example, you can change the company name or tone in the prompt that says the bot is an Anthropic support assistant.
- To add or remove categories for classification, update the `customerSupportCategories` in the code (likely a constant in the project). You can also turn off category classification by setting the `USE_CATEGORIES` flag to false in the API route.
- The UI theme and layout can be changed by editing the components or Tailwind theme. For instance, colors and dark/light mode preferences are defined in `styles/themes.js` (or a similar file) which you can tweak.
- If you want to deploy a version without sidebars, you don’t need to manually strip the code. Simply run the appropriate NPM script. The `package.json` includes scripts such as `npm run dev:left` (launch with only left sidebar), `npm run dev:chat` (chat area only, no sidebars), etc. These set environment variables `NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR` or `NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR` accordingly before running the app. Similarly, there are corresponding build scripts (`build:left`, `build:chat`, etc.) for production builds without certain sidebars. Internally, the config uses these env vars to include/exclude sidebar components at runtime.

### Deployment

While you can run the app locally or host it on any platform supporting Node.js, the project provides guidance for deployment on AWS Amplify. There is an `amplify.yml` file with a build specification for Amplify Console deployment. If deploying on Amplify, note:

- In Amplify’s environment variable settings, use the keys with the `BAWS_` prefix (as in `.env.local`). Amplify blocks any env var starting with “AWS”, hence the project uses “BAWS” as a workaround.
- After first deploying, you may need to attach the `AmazonBedrockFullAccess` policy to the Amplify service role so that the deployed app can call Bedrock (as detailed in the README’s Amplify section).
- Amplify will build the project using the provided YAML, which echoes the env vars into a `.env` file for production and runs `npm run build`. Ensure the `knowledgeBases` array is configured in the code (or you pass a `KNOWLEDGE_BASE_ID` env var and modify the code to read from it).

You can also deploy to Vercel or other hosts since this is a standard Next.js app. Just remember to set up the required env vars in your hosting platform.

### Troubleshooting

If the bot isn’t responding or you encounter errors:

- Double-check that your API keys are correct and have the necessary permissions. An invalid Anthropic API key or one without access to Claude will cause failures. Similarly, if your AWS credentials lack Bedrock permissions or the Bedrock service is not available in the region you chose, retrieval will fail (the app will still answer if it can, but without context).
- Ensure your Anthropic account has access to the model IDs you’re using. The free tier might have Claude Instant models but not Claude 2, etc. You can adjust the model to one you have access to.
- If retrieval isn’t working (the bot always says it found no info), confirm that your knowledge base ID is correct and that you have populated the knowledge base with content. You can test the retrieval separately using AWS CLI or SDK to ensure it returns results for sample queries.
- Check the server logs (terminal output) for debug messages. The API route logs timing info and whether RAG (retrieval) succeeded. It will also log if a redirect to human was triggered.
- If you get an error about JSON parsing, it means Claude did not return a well-formed JSON. This can happen if the prompt goes off track. In development, you might tweak the prompt or reduce the complexity of the user query causing issues. Usually, Claude follows the instruction to return JSON as given in the prompt template.

### Contributing

This project is provided as a reference implementation (a quickstart). It may not be fully production-hardened and could contain bugs or areas for improvement. Contributions or forks are welcome if you plan to adapt it. Before using this in a real production scenario, thorough testing and possibly some adjustments (like adding authentication, rate limiting, better error handling, etc.) are recommended. Keep in mind that this is a prototype and comes with no warranties – use it as a starting point for your own customer support AI agent.
