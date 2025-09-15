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
  if (limit && limit.windowStart && limit.windowEnd) {
    const windowStart = new Date(limit.windowStart);
    const windowEnd = new Date(limit.windowEnd);
    if (now >= windowStart && now < windowEnd) {
      if (limit.requestCount >= 10) {
        // User exceeded limit
        return new Response(
          JSON.stringify({
            error:
              "Rate limit exceeded. You can send more messages after: " +
              windowEnd.toLocaleString(),
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      } else {
        // Increment request count
        await db
          .update(rateLimit)
          .set({ requestCount: limit.requestCount + 1, updatedAt: now })
          .where(eq(rateLimit.id, limit.id));
      }
    } else {
      // Window expired, reset
      await db
        .update(rateLimit)
        .set({
          requestCount: 2,
          windowStart: today,
          windowEnd: tomorrow,
          updatedAt: now,
        })
        .where(eq(rateLimit.id, limit.id));
    }
  } else {
    // No record, create one
    await db.insert(rateLimit).values({
      userId,
      requestCount: 1,
      windowStart: today,
      windowEnd: tomorrow,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Fetch user preferences for personalized system prompt
  const userPreferences = await getUserPreferences(userId, db, userInfo, eq);

  const { messages, model, searchEnabled, ResearchEnabled } = await req.json();
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

  const researchPrompt = `You are an expert research assistant tasked with conducting in-depth research on the provided topic. Your goal is to produce a comprehensive, well-structured report that is clear, accurate, and actionable. Follow these steps:

  1. **Understand the Topic**: Analyze the input topic or query: "${messages}". If the query is ambiguous, infer the most relevant interpretation based on context or clarify key aspects to focus on.
  2. **Research Process**:
     - Search for credible, recent sources (e.g., academic journals, reputable news, industry reports, government databases) using available tools or knowledge.
     - Prioritize sources from the last 5 years unless seminal works are relevant.
     - Cross-reference findings across multiple sources to ensure accuracy and reduce bias.
  3. **Extract Key Information**:
     - Identify main findings, methodologies, data points, and conclusions.
     - Note any limitations, contradictions, or gaps in the information.
     - Highlight pros and cons if applicable (e.g., for technologies, policies, or strategies).
  4. **Synthesize Findings**:
     - Organize the report thematically or chronologically for clarity.
     - Provide a concise summary of key insights (500-600 words).
     - Include a detailed section with specific evidence, citing sources where possible.
  5. **Output Format**:
     - Use Markdown for structure (headings, bullet points, tables if needed).
     - Structure the report as:
       - **Summary**: Brief overview of findings.
       - **Key Findings**: Detailed insights with evidence and citations.
       - **Limitations/Gaps**: Any issues or areas for further research.
       - **Recommendations**: Practical next steps or applications.
     - If data is available, suggest a Chart.js chart (bar, line, or pie) only if explicitly requested.
  6. **Cross-Model Validation**:
     - Leverage Gemini 1.5 Pro for initial research and structured analysis.
     - Refine findings using GPT-4o for deeper reasoning and narrative clarity.
     - Combine insights to ensure robustness and consistency.
  7. **Constraints**:
     - Avoid speculation or unverified claims; admit uncertainty if data is lacking.
     - Do not include personal opinions or biased language.
     - Ensure the response is concise yet comprehensive, targeting 500-1000 words unless specified otherwise.

  Example Output:
  \`\`\`markdown
  # Research Report: ${messages}

  ## Summary
  [100-200 word overview of findings]

  ## Key Findings
  - **Point 1**: [Detailed insight with evidence, source citation]
  - **Point 2**: [Detailed insight, including data or examples]
  - **Pros/Cons**: [If applicable, e.g., for technology or strategy]

  ## Limitations/Gaps
  - [Any missing data, contradictions, or limitations in sources]

  ## Recommendations
  - [Actionable steps or future research directions]
  \`\`\`

  If you need clarification on the topic or additional context, ask: "Can you specify the scope or focus of the research (e.g., industry, region, timeframe)?"`;
  let result;
  if (ResearchEnabled) {
    result = streamText({
      model: aiModel,
      system: personalizedSystemPrompt+researchPrompt,
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
