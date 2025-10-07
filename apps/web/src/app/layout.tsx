import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";
import { ChatProvider } from "@/contexts/ChatContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SparkChat - Free AI Chat with Gemini, Llama, GPT-OSS | Multi-Model AI Platform",
    template: "%s | SparkChat - AI Chat Platform"
  },
  description: "🚀 Free AI chat with 8+ models: Gemini 2.0 Flash, Llama 4 Scout, GPT-OSS 120B, Qwen 3-32B, DeepSeek R1. Real-time streaming, web search, PDF analysis, vision AI, multilingual support. No signup required - start chatting now!",
  keywords: [
    "free AI chat",
    "AI chatbot online",
    "Gemini 2.0 chat",
    "Llama 4 Scout chat",
    "GPT-OSS chat",
    "DeepSeek R1 chat",
    "Qwen chat",
    "Kimi K2 chat",
    "multi-model AI platform",
    "real-time AI streaming",
    "AI chat no signup",
    "free ChatGPT alternative",
    "AI vision analysis",
    "PDF AI analysis",
    "multilingual AI chat",
    "web search AI",
    "AI conversation platform",
    "artificial intelligence chat",
    "machine learning chat",
    "neural network chat",
    "AI assistant online",
    "conversational AI",
    "AI language models",
    "natural language processing",
    "AI text generation",
    "computer vision AI",
    "document AI analysis",
    "AI reasoning models"
  ],
  authors: [{ name: "Shivaraj Kolekar" }],
  creator: "Shivaraj Kolekar",
  publisher: "SparkChat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sparkchat.shivraj-kolekar.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sparkchat.shivraj-kolekar.in",
    title: "SparkChat - Free AI Chat with Gemini, Llama, GPT-OSS | Multi-Model AI Platform",
    description: "🚀 Free AI chat with 8+ models: Gemini 2.0, Llama 4 Scout, GPT-OSS, Qwen, DeepSeek. Real-time streaming, web search, PDF analysis, vision AI, multilingual support. No signup required!",
    siteName: "SparkChat",
    images: [
      {
        url: "/sparkchat-ui.png",
        width: 1200,
        height: 630,
        alt: "SparkChat - Multi-Model AI Chat Interface"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkChat - Free AI Chat Platform",
    description: "🚀 Chat with 8+ AI models FREE! Gemini 2.0, Llama 4 Scout, GPT-OSS, DeepSeek & more. Real-time streaming, web search, PDF analysis. No signup needed!",
    images: ["/sparkchat-ui.png"],
    creator: "@Shivaraj_Kolekar",
    site: "@SparkChatAI",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/sparkchat-fav.png", sizes: "192x192", type: "image/png" },
      { url: "/sparkchat-favv.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/sparkchat-fav.png",
  },
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SparkChat",
  },
  category: "technology",
  classification: "AI Chat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="application-name" content="SparkChat" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="SparkChat" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#000000" />

          {/* Structured Data for Search Engines */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "SparkChat",
                "alternateName": "SparkChat AI",
                "description": "Free multi-model AI chat platform with 8+ AI models including Gemini 2.0 Flash, Llama 4 Scout, GPT-OSS 120B, Qwen 3-32B, and DeepSeek R1. Features real-time streaming, web search, PDF analysis, vision AI, and multilingual support.",
                "url": "https://sparkchat.shivraj-kolekar.in",
                "applicationCategory": ["CommunicationApplication", "ProductivityApplication", "EducationalApplication"],
                "operatingSystem": ["Windows", "macOS", "Linux", "iOS", "Android"],
                "browserRequirements": "Chrome 90+, Firefox 88+, Safari 14+, Edge 90+",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "description": "Free AI chat with daily credit system"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "247",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "author": {
                  "@type": "Person",
                  "name": "Shivaraj Kolekar"
                },
                "datePublished": "2025-01-27",
                "dateModified": "2025-01-27",
                "screenshot": [
                  "https://sparkchat.shivraj-kolekar.in/sparkchat-ui.png",
                  "https://sparkchat.shivraj-kolekar.in/sparkchat-models.png"
                ],
                "softwareVersion": "2.0.0",
                "releaseNotes": "Enhanced multi-model AI chat platform with 8+ AI models, improved performance, and new features",
                "features": [
                  "8+ AI Models (Gemini, Llama, GPT-OSS, Qwen, DeepSeek, Kimi K2)",
                  "Real-time streaming responses",
                  "Multilingual conversation support",
                  "Web search integration",
                  "PDF document analysis",
                  "Image and vision AI",
                  "Personalized AI responses",
                  "Daily credit system",
                  "Dark/Light mode themes",
                  "Mobile responsive design",
                  "No registration required",
                  "Free to use"
                ],
                "softwareRequirements": "Web browser with JavaScript enabled",
                "memoryRequirements": "512MB RAM minimum",
                "storageRequirements": "No local storage required",
                "interactionType": "https://schema.org/ChatApplication",
                "serviceType": "AI Chat Service",
                "audience": {
                  "@type": "Audience",
                  "audienceType": ["Developers", "Students", "Researchers", "AI Enthusiasts", "General Public"]
                },
                "provider": {
                  "@type": "Organization",
                  "name": "SparkChat",
                  "url": "https://sparkchat.shivraj-kolekar.in"
                },
                "potentialAction": {
                  "@type": "UseAction",
                  "target": "https://sparkchat.shivraj-kolekar.in",
                  "description": "Start chatting with AI models"
                }
              })
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Analytics />
          <Providers>
            <ChatProvider>
              <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
            </ChatProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
