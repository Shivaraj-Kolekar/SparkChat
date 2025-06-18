# SparkChat

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Next, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **tRPC** - End-to-end type-safe APIs
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **Turborepo** - Optimized monorepo build system
- **AI Integration** - Support for multiple AI models (Gemini, Groq, Ollama)
- **Real-time Chat** - Interactive chat interface with streaming responses
- **User Preferences** - Personalized AI responses based on user settings

## 🚀 Advanced Features

### 🤖 Multi-Model AI Support

SparkChat supports a wide range of AI models with different capabilities:

#### **Google Gemini Models**

- **Gemini 2.0 Flash** - High-performance multimodal model with text, vision, PDF support, and web search
- **Gemini 2.0 Flash Lite** - Fast, streamlined version optimized for quick responses
- **Gemini 2.5 Flash** - Cutting-edge model with advanced multimodal capabilities

#### **Meta Llama Models**

- **Llama 4 Scout** - Versatile multimodal model supporting text, vision, and multilingual content
- **Llama 3** - Powerful text-based model with multilingual capabilities
- **Llama 3.1** - Advanced iteration with enhanced conversational abilities

#### **Qwen Models**

- **Qwen QwQ** - Robust language model with strong reasoning abilities

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

- **Better Auth Integration** - Secure authentication with multiple providers
- **Google OAuth** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account
- **Session Management** - Secure session handling with cookies
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

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"

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

#### Google OAuth

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

## Project Structure

```
SparkChat/
├── apps/
│   ├── web/                 # Frontend application (Next.js)
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utility functions
│   │   │   └── types/       # TypeScript type definitions
│   │   └── public/          # Static assets
│   └── server/              # Backend API (Next.js)
│       ├── src/
│       │   ├── app/         # API routes
│       │   ├── db/          # Database schema and migrations
│       │   ├── lib/         # Server utilities
│       │   └── routers/     # tRPC routers
│       └── drizzle.config.ts
├── packages/                # Shared packages
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

   - Verify `BETTER_AUTH_SECRET` is set
   - Check `CORS_ORIGIN` includes your frontend URL
   - Ensure OAuth redirect URIs are correct

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
- `BETTER_AUTH_SECRET` with a strong secret
- `BETTER_AUTH_URL` with your production server URL
