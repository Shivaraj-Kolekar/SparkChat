import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Globe, Languages, Eye, FileText, Zap, MessageSquare, Users, Shield, Sparkles, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About SparkChat - Multi-Model AI Chat Platform",
  description: "Learn about SparkChat, the comprehensive AI chat platform supporting Gemini, Llama, GPT-OSS, Qwen, and DeepSeek. Built by Shivaraj Kolekar with modern web technologies for the best AI chat experience.",
  keywords: [
    "about SparkChat",
    "AI chat platform",
    "Shivaraj Kolekar",
    "multi-model AI",
    "Gemini chat",
    "Llama chat",
    "GPT-OSS",
    "open source AI chat",
    "Next.js AI app",
    "TypeScript AI platform"
  ],
  openGraph: {
    title: "About SparkChat - Multi-Model AI Chat Platform",
    description: "Learn about SparkChat, the comprehensive AI chat platform supporting multiple AI models with real-time streaming and advanced features.",
    url: "https://sparkchat.shivraj-kolekar.in/about",
    type: "website",
    images: [
      {
        url: "/sparkchat-ui.png",
        width: 1200,
        height: 630,
        alt: "About SparkChat - Multi-Model AI Chat Platform"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SparkChat - Multi-Model AI Chat Platform",
    description: "Learn about SparkChat, the comprehensive AI chat platform supporting multiple AI models.",
    images: ["/sparkchat-ui.png"],
  },
  alternates: {
    canonical: "https://sparkchat.shivraj-kolekar.in/about",
  },
};

export default function AboutPage() {
  const techStack = [
    { name: "Next.js", description: "Full-stack React framework for modern web applications" },
    { name: "TypeScript", description: "Type-safe development with enhanced developer experience" },
    { name: "TailwindCSS", description: "Utility-first CSS framework for rapid UI development" },
    { name: "shadcn/ui", description: "Beautiful and accessible UI components" },
    { name: "Drizzle ORM", description: "TypeScript-first database toolkit" },
    { name: "PostgreSQL", description: "Robust relational database for data storage" },
    { name: "Clerk", description: "Complete authentication and user management" },
    { name: "Turborepo", description: "High-performance build system for monorepos" }
  ];

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "8+ AI Models",
      description: "Support for Gemini, Llama, GPT-OSS, Qwen, DeepSeek, and Kimi K2 in one platform",
      highlight: "Premium & Standard Models"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Real-time Streaming",
      description: "Experience live AI responses with streaming technology for instant interactions",
      highlight: "Zero Latency Chat"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Web Search Integration",
      description: "AI models can search the web for up-to-date information and current events",
      highlight: "Always Current"
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Vision & PDF Analysis",
      description: "Upload images and PDFs for AI-powered analysis and insights",
      highlight: "Multimodal AI"
    },
    {
      icon: <Languages className="h-8 w-8" />,
      title: "Multilingual Support",
      description: "Chat in multiple languages with AI models that understand globally",
      highlight: "Global Communication"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Personalized AI",
      description: "Customize AI behavior based on your profession and communication style",
      highlight: "Tailored Experience"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Sparkles className="h-4 w-4 mr-1" />
            About SparkChat
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Future of AI Chat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            SparkChat brings together the most powerful AI models in one seamless platform,
            designed for developers, researchers, and AI enthusiasts who demand the best.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          To democratize access to cutting-edge AI technology by providing a unified platform
          where users can interact with multiple AI models, compare their capabilities, and
          choose the best solution for their specific needs. We believe AI should be accessible,
          powerful, and user-friendly for everyone.
        </p>
      </section>

      {/* Key Features */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">What Makes SparkChat Special</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with modern web technologies and designed for performance, accessibility, and user experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:shadow-lg transition-all duration-200">
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="text-xs">
                  {feature.highlight}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Built with Modern Technology</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SparkChat leverages the latest web technologies for optimal performance and developer experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((tech, index) => (
            <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{tech.name}</h3>
              <p className="text-sm text-muted-foreground">{tech.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Developer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              SparkChat is created and maintained by Shivaraj Kolekar, a passionate full-stack developer
              with expertise in modern web technologies and AI integration.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center">
              <Users className="h-16 w-16 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Shivaraj Kolekar</h3>
              <p className="text-muted-foreground">Full-Stack Developer & AI Enthusiast</p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="https://github.com/Shivaraj-Kolekar" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="https://linkedin.com/in/shivaraj-kolekar" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Open Source & Community</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            SparkChat is built as an open-source project, inspired by the T3 Chat app and the amazing
            developer community. We believe in transparency, collaboration, and giving back to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Github className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Open Source</h3>
            <p className="text-muted-foreground text-sm">
              Full source code available on GitHub for learning, contributing, and customization.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-muted-foreground text-sm">
              Built with feedback from developers and AI enthusiasts from around the world.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Continuous Innovation</h3>
            <p className="text-muted-foreground text-sm">
              Regular updates with new AI models, features, and performance improvements.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-primary/5 rounded-2xl p-8 md:p-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Experience SparkChat?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start chatting with multiple AI models today. No setup required, completely free to use.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-3" asChild>
            <Link href="/">
              Start Chatting Now
              <MessageSquare className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
            <Link href="https://github.com/Shivaraj-Kolekar/SparkChat" target="_blank" rel="noopener noreferrer">
              View Source Code
              <Github className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
