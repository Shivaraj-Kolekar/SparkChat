# SparkChat

![SparkChat UI](apps/web/public/sparkchat-ui.png)

_Screenshot: SparkChat main chat interface_

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Next, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Google and Github authentication with Clerk
- **Turborepo** - Optimized monorepo build system
- **AI Integration** - Support for multiple AI models (Gemini, Groq, Ollama)
- **Real-time Chat** - Interactive chat interface with streaming responses
- **User Preferences** - Personalized AI responses based on user settings

## 🚀 Advanced Features

### 🤖 Multi-Model AI Support

SparkChat supports a diverse range of AI models with different capabilities and credit costs. Each model is optimized for specific use cases:

#### **Premium Models** (2 Credits per Request)

**OpenAI Models:**
- **GPT-OSS 120B** - Highly capable large language model engineered for generating detailed text, understanding nuanced instructions, and facilitating natural conversations. Features extensive multilingual support and advanced reasoning skills for demanding global applications.
  - *Use Cases:* Text Generation, Advanced Reasoning
  
- **GPT-OSS 20B** - Versatile large language model specializing in high-quality text production, instruction following, and interactive dialogue. Efficient performance with multilingual capabilities makes it excellent for diverse language processing tasks.
  - *Use Cases:* Text Generation, Reasoning

**Qwen Models:**
- **Qwen 3-32B** - Robust language model known for strong reasoning abilities and efficient text processing. Particularly effective in scenarios demanding logical deduction, analytical insights, and structured outputs.
  - *Use Cases:* Text Generation, Advanced Reasoning

**DeepSeek Models:**
- **DeepSeek R1 Distill Llama 70B** - Powerful language model excelling in reasoning and code generation, ideal for complex problem-solving and development tasks.
  - *Use Cases:* Text Generation, Advanced Reasoning

#### **Standard Models** (1 Credit per Request)

**Google Gemini Models:**
- **Gemini 2.0 Flash** - High-performance multimodal model from Google that excels in processing both text and visual information, including PDF insights, with robust search capabilities for comprehensive data retrieval and analysis.
  - *Use Cases:* Text, Vision, PDFs, Web Search

**Meta Llama Models:**
- **Llama 4 Scout** - Versatile multimodal model capable of understanding and generating content from text and images. Supports a wide range of languages, making it ideal for diverse global applications.
  - *Use Cases:* Vision, Text, Multilingual

- **Llama 3.1** - Advanced iteration of Meta's Llama series with refined text generation and improved multilingual support. Offers enhanced conversational abilities optimized for complex language tasks with nuanced, contextually aware responses.
  - *Use Cases:* Text, Multilingual

**Moonshot AI Models:**
- **Kimi K2 Instruct** - Advanced large language model that excels at generating coherent text, following complex instructions, and engaging in interactive conversations. Strong multilingual support and robust reasoning abilities make it ideal for applications demanding precise language understanding.
  - *Use Cases:* Text, Multilingual

#### **Credit System**
- **Premium Models:** 2 credits per request (GPT-OSS series, Qwen 3-32B, DeepSeek R1)
- **Standard Models:** 1 credit per request (Gemini, Llama, Kimi K2)
- **Daily Limit:** 10 total credits per day (resets at midnight)
- **Usage Tracking:** Real-time credit counter and reset notifications

### 🔍 Web Search Integration

- **Real-time Web Search** - Enable web search for up-to-date information
- **Search Grounding** - Models can search the web to provide current answers
- **Toggle Control** - Easy on/off switch for web search functionality

### 📊 Rate Limiting & Usage Management

- **Daily Message Limits** - Configurable rate limiting (10 messages per day by default)
- **Usage Tracking** - Real-time remaining message counter
- **Reset Scheduling** - Automatic quota reset at midnight
- **Visual Indicators** - Clear warnings when approaching limits

### 🌐 Multilingual Support

- **Multi-language Models** - Support for various languages across different models
- **Global Accessibility** - Models capable of understanding and responding in multiple languages
- **Language Detection** - Automatic language handling

### 💻 Code & Development Features

- **Code Syntax Highlighting** - Beautiful code rendering with syntax highlighting
- **Markdown Support** - Rich text formatting with full markdown capabilities
- **Code Block Rendering** - Properly formatted code blocks with language detection
- **Copy Code Functionality** - Easy code copying from responses

### 🔐 Authentication & Security

- **Clerk Integration** - Secure authentication with Clerk (email/password, Google, GitHub, and more)
- **Google OAuth** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account
- **Session Management** - Secure session handling with cookies and Clerk tokens
- **User Account Management** - Profile settings and account deletion

### 💬 Chat & Conversation Features

- **Real-time Streaming** - Live streaming responses for better user experience
- **Chat History** - Persistent chat history with database storage
- **Message Sync** - Synchronized messages across sessions
- **Chat Management** - Create, delete, and organize conversations
- **Sidebar Navigation** - Easy chat switching and management
- **Search Chats** - Quick search through chat history (Ctrl+K)

### 🎨 User Interface & Experience

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark/Light Mode** - Theme switching with system preference detection
- **Collapsible Sidebar** - Space-efficient interface with animated transitions
- **Loading States** - Smooth loading indicators and skeleton screens
- **Toast Notifications** - User-friendly feedback and error messages
- **Keyboard Shortcuts** - Power user features with hotkey support

### 🎯 Personalized AI Responses

- **User Preferences** - Customizable AI behavior based on user settings
- **Professional Context** - AI adapts to user's profession and background
- **Communication Style** - Personalized response tone and style
- **User Description** - Custom user context for better AI understanding
- **Dynamic System Prompts** - AI responses tailored to individual users

### 📱 Progressive Web App (PWA)

- **Offline Support** - Basic offline functionality
- **App-like Experience** - Installable as a native app
- **Manifest Configuration** - Proper PWA setup with icons and metadata

### 🔧 Developer Features

- **Debug Component** - Built-in debugging tools for development
- **Environment Monitoring** - Real-time environment variable checking
- **API Health Checks** - System status monitoring
- **Error Handling** - Comprehensive error handling and logging
- **Type Safety** - Full TypeScript support throughout the stack

### 📊 Data Management

- **PostgreSQL Database** - Robust data storage with Drizzle ORM
- **Database Migrations** - Version-controlled schema changes
- **Data Relationships** - Proper foreign key relationships
- **Query Optimization** - Efficient database queries
- **Studio Interface** - Visual database management with Drizzle Studio

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

#### Server Environment Variables

Create a `.env` file in `apps/server/` with the following variables:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@your-neon-host:5432/sparkchat_db"
DATABASE_URL_POOLER="postgresql://username:password@your-neon-host:5432/sparkchat_db"

# CORS Configuration
CORS_ORIGIN="http://localhost:3001"

# Clerk Auth Configuration
CLERK_SECRET_KEY="your-clerk-secret-key"
CLERK_PUBLISHABLE_KEY="your-clerk-frontend-api-key"

# Google OAuth (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional - for social login)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI API Keys
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
GROQ_API_KEY="your-groq-api-key"

# Environment
NODE_ENV="development"
```

#### Web Environment Variables

Create a `.env` file in `apps/web/` with:

```bash
# Server URL Configuration
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 3. Database Setup

#### Option A: Using Neon (Recommended)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from your project dashboard
4. Update the `DATABASE_URL` in your server `.env` file
5. The connection string should look like:
   ```
   postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb
   ```

#### Option B: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database named `sparkchat_db`
3. Update the `DATABASE_URL` to point to your local database

### 4. Apply Database Schema

```bash
npm run db:push
```

### 5. Run the Development Server

```bash
npm run dev
```

The web application will be available at [http://localhost:3001](http://localhost:3001)
The API server will be running at [http://localhost:3000](http://localhost:3000)

## API Keys Setup

### Google AI (Gemini Models)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to `GOOGLE_GENERATIVE_AI_API_KEY` in your server `.env`

### Groq (Llama Models)

1. Go to [Groq Console](https://console.groq.com/)
2. Create an API key
3. Add it to `GROQ_API_KEY` in your server `.env`

### OAuth Setup (Optional)

#### Clerk Social Login

1. In the Clerk dashboard, enable Google, GitHub, or other providers under **Social Connections**.
2. Follow Clerk's instructions to set up OAuth credentials for each provider.
3. Clerk will handle the OAuth flow and user management automatically.

#### Google OAuth (Legacy/Custom)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your `.env` file

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:3001`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret to your `.env` file

## Clerk Authentication Setup

SparkChat uses [Clerk](https://clerk.com/) for authentication, supporting email/password, social logins, and secure session management.

### 1. Create a Clerk Project

- Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create a new project.
- Add your app's frontend and backend URLs in the Clerk dashboard (e.g., `http://localhost:3001` for web, `http://localhost:3000` for API).
- Configure allowed redirect URLs for sign-in, sign-up, and SSO callbacks.

### 2. Get Clerk API Keys

- In the Clerk dashboard, go to **API Keys**.
- Copy the **Frontend API** and **Secret Key**.

### 3. Set Environment Variables

#### Web Environment (`apps/web/.env`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-frontend-api-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Server Environment (`apps/server/.env`):

```
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_PUBLISHABLE_KEY=your-clerk-frontend-api-key
```

### 4. Configure Clerk in Your App

- The app is already set up to use Clerk's React components (`<SignIn />`, `<SignUp />`, `<UserButton />`, etc.).
- The backend uses Clerk's server SDK to verify sessions and manage users.
- Clerk's theme will match your app's dark/light mode automatically.

### 5. Social Login (Google, GitHub, etc.)

- Enable social providers in the Clerk dashboard under **Social Connections**.
- Add any required OAuth credentials in Clerk and your `.env` files as needed.

### 6. Custom Domains (Production)

- Add your production domains in the Clerk dashboard for both frontend and backend.
- Update all Clerk-related environment variables to use your production keys and URLs.

## Project Structure

```
SparkChat/
├── apps/
│   ├── web/                 # Frontend application (Next.js)
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   │   ├── components/  # React components
│   │   │   │   ├── lib/         # Utility functions
│   │   │   │   └── types/       # TypeScript type definitions
│   │   │   └── public/          # Static assets
│   │   └── server/              # Backend API (Next.js)
│   │       ├── src/
│   │       │   ├── app/         # API routes
│   │       │   ├── db/          # Database schema and migrations
│   │       │   ├── lib/         # Server utilities
│   │       │   └── routers/     # tRPC routers
│   │       └── drizzle.config.ts
│   └── packages/                # Shared packages
└── turbo.json              # Turborepo configuration
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open database studio UI
- `npm run db:generate`: Generate new database migrations
- `npm run db:migrate`: Run database migrations

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify your `DATABASE_URL` is correct
   - Ensure your database is running
   - Check if your IP is whitelisted (for cloud databases)

2. **Authentication Issues**

   - Verify `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` are set
   - Check `CORS_ORIGIN` includes your frontend URL
   - Ensure Clerk dashboard redirect URIs are correct

3. **AI API Errors**

   - Verify API keys are valid and have sufficient credits
   - Check if the API service is available
   - Ensure you're using the correct model names

4. **Port Conflicts**
   - Server runs on port 3000 by default
   - Web app runs on port 3001 by default
   - Change ports in package.json if needed

### Development Tips

- Use the debug component in the bottom-right corner to check environment variables
- Check server logs for detailed error messages
- Use `npm run db:studio` to inspect your database
- The health check endpoint `/api/health` shows system status

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy both apps (web and server)
4. Update `NEXT_PUBLIC_SERVER_URL` to your production server URL
5. Update `CORS_ORIGIN` to include your production domain

### Environment Variables for Production

Make sure to update these for production:

- `NODE_ENV="production"`
- `CORS_ORIGIN` with your production domain
- `CLERK_SECRET_KEY` with your Clerk secret key
- `CLERK_PUBLISHABLE_KEY` with your Clerk frontend API key
