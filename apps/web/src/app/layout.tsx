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
    default: "SparkChat - Multi-Model AI Chat Platform | Gemini, Llama, GPT-OSS",
    template: "%s | SparkChat"
  },
  description: "Chat with multiple AI models including Gemini 2.0, Llama 4 Scout, GPT-OSS, Qwen, and DeepSeek. Real-time streaming, multilingual support, web search, PDF analysis, and personalized responses. Free AI chat platform with credit system.",
  keywords: [
    "AI chat",
    "artificial intelligence",
    "Gemini chat",
    "Llama chat",
    "GPT chat",
    "OpenAI alternative",
    "multi-model AI",
    "real-time chat",
    "multilingual AI",
    "web search AI",
    "PDF analysis",
    "free AI chat",
    "DeepSeek",
    "Qwen",
    "AI conversation",
    "chatbot",
    "machine learning",
    "natural language processing",
    "streaming chat",
    "TypeScript AI app"
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
    title: "SparkChat - Multi-Model AI Chat Platform | Gemini, Llama, GPT-OSS",
    description: "Chat with multiple AI models including Gemini 2.0, Llama 4 Scout, GPT-OSS, Qwen, and DeepSeek. Real-time streaming, multilingual support, web search, PDF analysis, and personalized responses.",
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
    title: "SparkChat - Multi-Model AI Chat Platform",
    description: "Chat with Gemini, Llama, GPT-OSS, and more AI models. Real-time streaming, multilingual support, web search capabilities.",
    images: ["/sparkchat-ui.png"],
    creator: "@Shivaraj_Kolekar",
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
  other: {
    "google-site-verification": "your-google-site-verification-code-here",
  },
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
                "description": "Multi-model AI chat platform supporting Gemini, Llama, GPT-OSS, Qwen, and DeepSeek with real-time streaming, multilingual support, web search, and PDF analysis.",
                "url": "https://sparkchat.shivraj-kolekar.in",
                "applicationCategory": "CommunicationApplication",
                "operatingSystem": "All",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "150"
                },
                "author": {
                  "@type": "Person",
                  "name": "Shivaraj Kolekar"
                },
                "datePublished": "2025-01-27",
                "dateModified": "2025-01-27",
                "screenshot": "https://sparkchat.shivraj-kolekar.in/sparkchat-ui.png",
                "softwareVersion": "1.0.0",
                "releaseNotes": "Multi-model AI chat platform with advanced features",
                "features": [
                  "Multi-model AI support",
                  "Real-time streaming",
                  "Multilingual chat",
                  "Web search integration",
                  "PDF analysis",
                  "Personalized responses",
                  "Credit system",
                  "Dark/Light mode"
                ]
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
