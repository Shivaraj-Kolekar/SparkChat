import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Globe, Languages, Eye, FileText, Zap, MessageSquare, Users, Shield, Sparkles } from "lucide-react";

export default function SEOContent() {
  const models = [
    { name: "Gemini 2.5 Flash", provider: "Google", features: ["Text", "Vision", "PDFs", "Web Search"] },
    { name: "Llama 4 Scout", provider: "Meta", features: ["Vision", "Text", "Multilingual"] },
    { name: "GPT-OSS 120B", provider: "OpenAI", features: ["Text", "Advanced Reasoning"] },
    { name: "Qwen 3-32B", provider: "Qwen", features: ["Text", "Reasoning"] },
    { name: "DeepSeek R1", provider: "DeepSeek", features: ["Text", "Code Generation"] },
    { name: "Kimi K2 Instruct", provider: "Moonshot AI", features: ["Text", "Multilingual"] }
  ];

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Real-time Streaming Chat",
      description: "Experience seamless conversations with instant AI responses and live message streaming."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Multi-Model AI Support",
      description: "Access 8+ premium AI models including Gemini, Llama, GPT-OSS, Qwen, and DeepSeek in one platform."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Web Search Integration",
      description: "Get up-to-date information with real-time web search capabilities powered by AI."
    },
    {
      icon: <Languages className="h-6 w-6" />,
      title: "Multilingual Support",
      description: "Chat in multiple languages with AI models that understand and respond globally."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Vision & Image Analysis",
      description: "Upload and analyze images with advanced vision-capable AI models like Gemini and Llama."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "PDF Document Analysis",
      description: "Extract insights and ask questions about your PDF documents with AI-powered analysis."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Personalized Responses",
      description: "Customize AI behavior based on your profession, communication style, and preferences."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with Clerk authentication and encrypted data storage."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Sparkles className="h-4 w-4 mr-1" />
            Free Multi-Model AI Chat Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Chat with Multiple AI Models
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Access Gemini 2.5, Llama 4 Scout, GPT-OSS, Qwen, and DeepSeek in one powerful platform with real-time streaming, web search, and multilingual support.
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          <Badge variant="outline">Free AI Chat</Badge>
          <Badge variant="outline">Real-time Streaming</Badge>
          <Badge variant="outline">8+ AI Models</Badge>
          <Badge variant="outline">Web Search</Badge>
          <Badge variant="outline">PDF Analysis</Badge>
          <Badge variant="outline">Multilingual</Badge>
          <Badge variant="outline">Vision Capable</Badge>
          <Badge variant="outline">No Setup Required</Badge>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose SparkChat?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive AI chat platform with advanced features and multiple model support
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Models Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Supported AI Models</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from premium and standard AI models, each optimized for specific use cases
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{model.provider}</CardDescription>
                  </div>
                  <Badge variant="secondary">{model.features.length} Features</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">How SparkChat Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in seconds with our intuitive AI chat platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold">Choose Your AI Model</h3>
            <p className="text-muted-foreground">
              Select from Gemini, Llama, GPT-OSS, Qwen, or DeepSeek based on your specific needs.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold">Start Chatting</h3>
            <p className="text-muted-foreground">
              Type your message, upload images, or attach PDFs for instant AI-powered responses.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold">Get Smart Responses</h3>
            <p className="text-muted-foreground">
              Receive real-time streaming responses with web search, multilingual support, and personalization.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why Developers & Users Love SparkChat</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and designed for performance, accessibility, and user experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="space-y-3">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Built with Next.js, TypeScript, and optimized for speed with real-time streaming responses.
              </p>
            </div>
            <div className="space-y-3">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Secure authentication with Clerk, encrypted data storage, and enterprise-grade privacy protection.
              </p>
            </div>
            <div className="space-y-3">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">User Friendly</h3>
              <p className="text-muted-foreground">
                Intuitive interface, responsive design, and personalized AI responses for the best user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Is SparkChat free to use?</h3>
            <p className="text-muted-foreground">
              Yes! SparkChat is completely free with a daily credit system. You get 10 credits per day, with premium models using 2 credits and standard models using 1 credit per request.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Which AI models are supported?</h3>
            <p className="text-muted-foreground">
              We support 8+ AI models including Gemini 2.5 Flash, Llama 4 Scout, GPT-OSS 120B/20B, Qwen 3-32B, DeepSeek R1, and Kimi K2 Instruct.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Can I analyze images and PDFs?</h3>
            <p className="text-muted-foreground">
              Absolutely! Our vision-capable models like Gemini 2.5 Flash and Llama 4 Scout can analyze images, extract text from PDFs, and provide insights about visual content.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Is my data secure?</h3>
            <p className="text-muted-foreground">
              Yes, we use enterprise-grade security with Clerk authentication, encrypted data storage, and follow best practices for privacy protection.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Does it work on mobile devices?</h3>
            <p className="text-muted-foreground">
              SparkChat is fully responsive and works seamlessly on desktop, tablet, and mobile devices. It's also a Progressive Web App (PWA) that can be installed.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Can I customize AI responses?</h3>
            <p className="text-muted-foreground">
              Yes! You can personalize AI behavior by setting your profession, communication style, traits, and preferences in the settings page.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-primary/5 rounded-2xl p-8 md:p-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Start Chatting with AI Models Today</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users already experiencing the future of AI conversations. No setup required, start chatting in seconds.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-3">
            Start Free Chat Now
            <MessageSquare className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            View All Models
            <Brain className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-6">
          <span>✓ No Registration Required</span>
          <span>✓ 10 Free Credits Daily</span>
          <span>✓ 8+ AI Models</span>
          <span>✓ Real-time Streaming</span>
        </div>
      </section>
    </div>
  );
}
