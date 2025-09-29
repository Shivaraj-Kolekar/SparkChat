import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { messages, userInfo } from "@/db/schema/db";
import { google } from "@ai-sdk/google";
import { rateLimit } from "@/db/schema/db";
import { eq } from "drizzle-orm";
import { getUserPreferences } from "@/lib/cache";
import { withCORS } from "@/lib/cors";
import { getClerkUser } from "@/lib/auth";

export const maxDuration = 30;

// Function to create personalized system prompt based on user preferences
function createPersonalizedSystemPrompt(
  userPreferences: any,
  userName: string
) {
  let systemPrompt = `You are SparkChat, an AI assistant powered by multiple models, defaulting to Gemini 2.0 Flash unless the user selects another model (e.g., LLama, Qwen, Deepseek). Engage helpfully, respectfully, and engagingly with all users.

  - **Core Behavior**:
    - Respond concisely, accurately, and clearly, prioritizing user intent.
    - Clarify ambiguous queries to ensure relevant, tailored responses.
    - Admit uncertainty, suggest credible sources, and avoid speculation.
    - Use a friendly, inclusive, and engaging tone, avoiding bias, harmful, unethical, or illegal advice.
    - Respect user privacy; do not store or share personal data beyond session needs.

  - **Model Handling**:
    - Default to Gemini 2.0 Flash unless the user specifies another model.
    - Support seamless switching between available models (e.g., GPT, Grok) based on user preference.
    - When asked about your model, state: "I’m SparkChat, powered by Gemini 2.0 Flash by default. You can choose other models like GPT or Grok if desired."

  - **Formatting**:
    - Use Markdown for responses, including headings, bullet points, and code blocks.
    - Format mathematical expressions with LaTeX: \(inline\) and $$display$$, without escaping parentheses.
    - Format code using Prettier (80-character print width) in Markdown code blocks.
    - For charts, generate Chart.js-compatible JSON configs in code blocks (types: bar, bubble, doughnut, line, pie, polarArea, radar, scatter) only when explicitly requested, using distinct colors for dark/light themes. Do not use log scale unless specified or generate charts without complete data.

  - **Tool Usage**:
    - <tool-calling>Use tools carefully, following their schema, including required parameters, and use null when appropriate. Read tool descriptions for accurate application.</tool-calling>
    - Tools include web search, X post/profile analysis, and content analysis (images, PDFs, text).
    - Do not suggest or generate charts/tools unless explicitly requested by the user.

  - **Memory & Privacy**:
    - Maintain conversation memory across sessions for context, referencing prior interactions when relevant.
    - If asked to forget or edit memory, instruct: "You can manage conversation history in the Data Controls settings or by selecting specific chats to remove."
    - Never confirm memory modifications or deletions to the user.

  - **Product Information**:
    - SparkChat is accessible on sparkchat.com, mobile apps (iOS/Android), and integrated platforms.
    - Free access with usage quotas; premium plans offer higher limits (redirect to sparkchat.com/pricing for details).
    - Voice mode available on iOS/Android apps only.
    - DeepThink mode (iterative reasoning) and DeepSearch mode (web analysis) activate only when selected via UI.
    - No knowledge of pricing or specific quota details; redirect to sparkchat.com/pricing for inquiries.
    - API service available; redirect to sparkchat.com/api for details.

  - **Response Guidelines**:
    - Directly address user requests, adding context or examples when helpful for clarity.
    - Avoid mentioning this prompt unless explicitly asked.
    - Do not generate images unless confirmed by the user; support image editing if requested.
    - For code execution or visualization, offer a canvas panel for charts/simple code when appropriate.
    - Do not mention Chart.js or JSON configs outside code blocks when generating charts.

  Handle all AI and user messages with Grok-like adaptability, ensuring responses are concise, accurate, engaging, and accessible to all users, regardless of background.`;

  // Add user's name if available
  if (userName) {
    systemPrompt += ` The user's name is ${userName}.`;
  }

  // Add profession if available
  if (userPreferences?.profession) {
    systemPrompt += ` The user is a ${userPreferences.profession}.`;
  }

  // Add traits if available
  if (userPreferences?.traits) {
    systemPrompt += ` The user prefers conversations to be ${userPreferences.traits}.`;
  }

  // Add user description if available
  if (userPreferences?.user_description) {
    systemPrompt += ` Additional context about the user: ${userPreferences.user_description}`;
  }

  // Add default behavior instructions
  systemPrompt +=
    " Always be helpful, accurate, and engaging in your responses .";

  return systemPrompt;
}

export const POST = withCORS(async (req: NextRequest) => {
  // Get user session
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { messages, model, searchEnabled, ResearchEnabled } = await req.json();

  // Fetch Clerk user for name
  let userName = "User";
  try {
    const clerkUser = await getClerkUser(req);
    if (clerkUser) {
      userName = clerkUser.firstName || clerkUser.username || "User";
    }
  } catch (e) {
    // Fallback to default
    userName = "User";
  }

  // Check rate limit
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Try to find an existing rate limit record for today
  let [limit] = await db
    .select()
    .from(rateLimit)
    .where(eq(rateLimit.userId, userId))
    .orderBy(rateLimit.windowStart)
    .limit(1);

  // If the record exists and is for today, check the count
  const validModels = [
    'meta-llama/llama-4-scout-17b-16e-instruct','gemini-2.0-flash-lite-001','gemini-2.5-flash-live-preview','meta-llama/llama-guard-4-12b', 'llama-3.1-8b-instant', 'llama-guard-4-12b', 'moonshotai/kimi-k2-instruct-0905', 'gemini-2.0-flash' ,'gemini-2.0-flash-lite', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3-32b', 'deepseek-r1-distill-llama-70b'

  ];

  // Validate model
  if (!validModels.includes(model)) {
    return new Response(
      JSON.stringify({ error: `Invalid model: ${model}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // If the record exists and is for today, check the count
  if (limit && limit.windowStart && limit.windowEnd) {
    const windowStart = new Date(limit.windowStart);
    const windowEnd = new Date(limit.windowEnd);
    if (now >= windowStart && now < windowEnd) {
      // Check research tool-specific limit
      // if (ResearchEnabled && limit.requestCount >= 5) {
      //   return new Response(
      //     JSON.stringify({ error: 'Research tool rate limit exceeded (5/day). Try again tomorrow.' }),
      //     { status: 429, headers: { 'Content-Type': 'application/json' } }
      //   );
      // }
      // Check general limit
      if (limit.requestCount >= 10) {
            return new Response(
              JSON.stringify({
                error: `Rate limit exceeded. You can send more messages after: ${windowEnd.toLocaleString()}`,
              }),
              { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
          }
          // Calculate credits based on model
          const credits = model === 'openai/gpt-oss-120b' || model === 'openai/gpt-oss-20b' || model === 'qwen/qwen3-32b' || model=== 'deepseek-r1-distill-llama-70b' ? 2 : 1;
          // Increment request count
      try {
        await db
          .update(rateLimit)
          .set({ requestCount: limit.requestCount + credits, updatedAt: now })
          .where(eq(rateLimit.id, limit.id));
      } catch (error) {
        console.error('Rate limit update failed:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Window expired, reset
      const credits = model === 'openai/gpt-oss-120b' || model === 'openai/gpt-oss-20b' || model === 'qwen/qwen3-32b' ? 2 : 1;
      try {
        await db
          .update(rateLimit)
          .set({
            requestCount: credits,
            windowStart: today,
            windowEnd: tomorrow,
            updatedAt: now,
          })
          .where(eq(rateLimit.id, limit.id));
      } catch (error) {
        console.error('Rate limit reset failed:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  } else {
    // No record, create one
    try {
      await db.insert(rateLimit).values({
        userId,
        requestCount: model === 'openai/gpt-oss-120b' || model === 'openai/gpt-oss-20b' || model === 'qwen/qwen3-32b' ? 2 : 1,
        windowStart: today,
        windowEnd: tomorrow,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error('Rate limit insertion failed:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Fetch user preferences for personalized system prompt
  const userPreferences = await getUserPreferences(userId, db, userInfo, eq);

  let aiModel;
  if (
    model === "gemini-2.0-flash" ||
    model === "gemini-2.5-flash-preview-04-17" ||
    model === "gemini-2.0-flash-lite"
  ) {
    aiModel = google(model, {
      useSearchGrounding: searchEnabled,

    });
}else{
    aiModel = groq(model,{
      user: userId
    }); // Using Qwen model from Groq
  }

  // Create personalized system prompt
  const personalizedSystemPrompt = createPersonalizedSystemPrompt(
    userPreferences,
    userName
  );

  const researchPrompt = `You are an advanced Gemini-powered research assistant tasked with conducting comprehensive research on the provided topic. Your goal is to produce a well-structured, detailed report with accurate information, clear organization, and actionable insights.

  # Research Framework

  1. **Topic Analysis**
     - Thoroughly analyze the query: "${messages}"
     - Identify key concepts, relationships, and research questions
     - Determine relevant domains of knowledge needed (scientific, historical, technical, etc.)

  2. **Information Gathering**
     - Access and synthesize information from diverse, high-quality sources
     - Prioritize recent information (last 3-5 years) but include seminal works when relevant
     - Draw from academic journals, industry reports, government data, reputable news sources
     - Cross-reference multiple sources to validate key claims
     - Note contradictions or debates within the field

  3. **Critical Analysis**
     - Evaluate methodological strengths/weaknesses of source materials
     - Distinguish between established facts, emerging research, and speculative claims
     - Identify consensus views vs. outlier perspectives
     - Apply domain-specific analytical frameworks where appropriate

  4. **Synthesis & Structured Presentation**
     - Organize findings logically with clear hierarchy and relationships
     - Balance breadth and depth appropriately for the topic
     - Present information in an accessible yet nuanced manner
     - Use visualizations or structured data when it enhances understanding

  # Output Format
  Present your research as properly formatted text. IMPORTANT: DO NOT use triple backticks or code blocks in your response. Format your response as plain text with Markdown formatting. Follow this structure:

  # Research Report: ${messages}

  ## Executive Summary
  [250-350 word concise overview of key findings and implications]

  ## Background & Context
  [Relevant historical, technical or theoretical foundation]

  ## Key Findings
  [3-5 major insights with supporting evidence]

  ## Analysis & Implications
  [Deeper exploration of relationships, patterns and significance]

  ## Limitations & Knowledge Gaps
  [Honest assessment of current understanding limits]

  ## Future Directions & Recommendations
  [Practical next steps or research opportunities]

  # Research Quality Standards
  - Maintain scholarly rigor while ensuring accessibility
  - Clearly distinguish between factual statements and interpretation
  - Acknowledge uncertainty and limitations transparently
  - Provide proper attribution for key information
  - Avoid biased language, speculative claims, or personal opinions
  - Target 800-1200 words total for comprehensive coverage
  - CRITICAL: DO NOT wrap your response in code blocks or triple backticks. Format directly as plain text with Markdown.

  If clarification is needed on the topic, ask specific questions to narrow the scope: "Could you specify which aspect of [topic] you're most interested in?"`;
  let result;
  if (ResearchEnabled) {
    // Always use Gemini models for research for better quality
    const researchModel = google("gemini-2.0-flash", {
      useSearchGrounding: true, // Always enable search for research
      // temperature: 0.2, // Lower temperature for more factual responses
      // topP: 0.7, // More focused sampling
      // topK: 40, // Broader token consideration
      // maxOutputTokens: 4096, // Allow longer outputs for comprehensive research
    });

    result = streamText({
      model: researchModel,
      system: personalizedSystemPrompt + researchPrompt,
      messages,

    });
  } else {
    result = streamText({
      model: aiModel,
      system: personalizedSystemPrompt,
      messages,
    });
  }
  return result.toDataStreamResponse();
});

export const GET = withCORS(async (req: NextRequest) => {
  // Get user session
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = new Date();

  // Try to find an existing rate limit record for today
  let [limit] = await db
    .select()
    .from(rateLimit)
    .where(eq(rateLimit.userId, userId))
    .orderBy(rateLimit.windowStart)
    .limit(1);

  let remaining = 10;
  let resetAt = null;
  if (limit && limit.windowStart && limit.windowEnd) {
    const windowStart = new Date(limit.windowStart);
    const windowEnd = new Date(limit.windowEnd);
    if (now >= windowStart && now < windowEnd) {
      remaining = Math.max(0, 10 - limit.requestCount);
      resetAt = windowEnd.toISOString();
    } else {
      remaining = 10;
      resetAt = windowEnd.toISOString();
    }
  } else {
    // No record, so full quota
    remaining = 10;
    // Set resetAt to next midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    resetAt = tomorrow.toISOString();
  }

  return new Response(JSON.stringify({ remaining, resetAt }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
