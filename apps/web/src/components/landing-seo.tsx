import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Globe,
  Languages,
  Eye,
  FileText,
  Zap,
  MessageSquare,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Rocket,
  Clock,
  Download,
  Smartphone
} from "lucide-react";
import Link from "next/link";

export default function LandingSEO() {
  const aiModels = [
    {
      name: "Gemini 2.5 Flash",
      provider: "Google",
      credits: 1,
      features: ["Text Generation", "Vision AI", "PDF Analysis", "Web Search"],
      description: "Google's latest multimodal AI with advanced vision and web search capabilities"
    },
    {
      name: "Llama 4 Scout",
      provider: "Meta",
      credits: 1,
      features: ["Vision AI", "Text Generation", "Multilingual"],
      description: "Meta's powerful multimodal model with exceptional multilingual support"
    },
    {
      name: "GPT-OSS 120B",
      provider: "OpenAI",
      credits: 2,
      features: ["Advanced Reasoning", "Text Generation"],
      description: "Premium large language model with superior reasoning capabilities"
    },
    {
      name: "Qwen 3-32B",
      provider: "Qwen",
      credits: 2,
      features: ["Text Generation", "Advanced Reasoning"],
      description: "Robust AI model optimized for analytical tasks and structured outputs"
    },
    {
      name: "DeepSeek R1",
      provider: "DeepSeek",
      credits: 2,
      features: ["Code Generation", "Advanced Reasoning"],
      description: "Specialized in code generation and complex problem-solving tasks"
    },
    {
      name: "Kimi K2 Instruct",
      provider: "Moonshot AI",
      credits: 1,
      features: ["Text Generation", "Multilingual"],
      description: "Advanced conversational AI with strong multilingual capabilities"
    }
  ];

  const keyFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "8+ Premium AI Models",
      description: "Access Gemini 2.5 Flash, Llama 4 Scout, GPT-OSS 120B, Qwen 3-32B, DeepSeek R1, and Kimi K2 in one platform",
      benefits: ["Compare AI responses", "Choose best model for task", "Switch models instantly"]
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-Time Streaming",
      description: "Experience lightning-fast AI responses with live streaming technology for instant conversations",
      benefits: ["Zero waiting time", "Live response updates", "Smooth conversation flow"]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Web Search Integration",
      description: "AI models can search the internet for current information, news, and real-time data",
      benefits: ["Up-to-date information", "Current events", "Real-time facts"]
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Vision AI & PDF Analysis",
      description: "Upload images and PDF documents for AI-powered analysis, text extraction, and insights",
      benefits: ["Image understanding", "Document analysis", "Visual content insights"]
    },
    {
      icon: <Languages className="h-8 w-8" />,
      title: "Multilingual Support",
      description: "Chat in 50+ languages with AI models that understand and respond globally",
      benefits: ["Global communication", "Language translation", "Cultural understanding"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Personalized AI Responses",
      description: "Customize AI behavior based on your profession, communication style, and preferences",
      benefits: ["Tailored responses", "Professional context", "Personal assistant"]
    }
  ];

  const useCases = [
    {
      title: "Students & Researchers",
      description: "Get help with homework, research papers, and academic projects",
      examples: ["Essay writing assistance", "Research question answers", "Study material creation"]
    },
    {
      title: "Developers & Engineers",
      description: "Code generation, debugging help, and technical documentation",
      examples: ["Code review and optimization", "Bug fixing assistance", "API documentation"]
    },
    {
      title: "Content Creators",
      description: "Generate blog posts, social media content, and creative writing",
      examples: ["Blog article writing", "Social media captions", "Creative storytelling"]
    },
    {
      title: "Business Professionals",
      description: "Email drafting, presentations, and business strategy discussions",
      examples: ["Professional emails", "Meeting summaries", "Business analysis"]
    }
  ];

  const comparisons = [
    {
      feature: "Multiple AI Models",
      sparkchat: "8+ Models (Gemini, Llama, GPT-OSS, etc.)",
      others: "1-2 Models"
    },
    {
      feature: "Cost",
      sparkchat: "Free with daily credits",
      others: "$20-100/month"
    },
    {
      feature: "Web Search",
      sparkchat: "Real-time web search",
      others: "Limited or none"
    },
    {
      feature: "Vision AI",
      sparkchat: "Full image & PDF analysis",
      others: "Basic image support"
    },
    {
      feature: "Registration",
      sparkchat: "No signup required",
      others: "Registration required"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10">
              <Sparkles className="h-4 w-4 mr-2" />
              Free Multi-Model AI Chat Platform
            </Badge>

            <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Chat with 8+ AI Models
              <br />
              <span className="text-3xl md:text-5xl">Completely Free</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Access <strong>Gemini 2.5 Flash</strong>, <strong>Llama 4 Scout</strong>, <strong>GPT-OSS 120B</strong>,
              <strong> Qwen 3-32B</strong>, <strong>DeepSeek R1</strong>, and <strong>Kimi K2</strong> in one platform.
              Real-time streaming, web search, PDF analysis, vision AI, and multilingual support.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            <Badge variant="outline" className="text-sm py-1">🚀 No Signup Required</Badge>
            <Badge variant="outline" className="text-sm py-1">⚡ Real-Time Streaming</Badge>
            <Badge variant="outline" className="text-sm py-1">🌐 Web Search AI</Badge>
            <Badge variant="outline" className="text-sm py-1">👁️ Vision & PDF Analysis</Badge>
            <Badge variant="outline" className="text-sm py-1">🗣️ 50+ Languages</Badge>
            <Badge variant="outline" className="text-sm py-1">📱 Mobile Friendly</Badge>
            <Badge variant="outline" className="text-sm py-1">💰 100% Free</Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              Start Free Chat Now
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View All 8 AI Models
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background" />
                ))}
              </div>
              <span>1000+ Happy Users</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Models Showcase */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">8 Powerful AI Models in One Platform</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose from premium and standard AI models, each optimized for specific tasks.
              Compare responses and find the perfect AI for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiModels.map((model, index) => (
              <Card key={index} className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <div className="absolute top-4 right-4">
                  <Badge variant={model.credits === 2 ? "destructive" : "secondary"} className="text-xs">
                    {model.credits} Credit{model.credits > 1 ? 's' : ''}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    <CardDescription className="font-medium text-primary">{model.provider}</CardDescription>
                    <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {model.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Try {model.name}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="inline-block p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Daily Credit System</h3>
                  <p className="text-muted-foreground">Get 10 free credits daily. Premium models use 2 credits, standard models use 1 credit.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Why Choose SparkChat Over Others?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The most comprehensive AI chat platform with features that others charge hundreds for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Perfect for Everyone</h2>
            <p className="text-lg text-muted-foreground">
              Whether you're a student, developer, creator, or business professional - SparkChat has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 border-2 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example, exampleIndex) => (
                    <li key={exampleIndex} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">SparkChat vs Others</h2>
            <p className="text-lg text-muted-foreground">
              See why thousands choose SparkChat over expensive alternatives.
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-left p-4 font-semibold text-primary">SparkChat</th>
                    <th className="text-left p-4 font-semibold">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4 font-medium">{comparison.feature}</td>
                      <td className="p-4 text-green-600 font-medium">{comparison.sparkchat}</td>
                      <td className="p-4 text-muted-foreground">{comparison.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Start Chatting with AI Models Now</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users experiencing the future of AI conversations.
              No credit card, no signup, no limits on creativity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-12 py-4 bg-gradient-to-r from-primary to-primary/80">
              <Rocket className="mr-2 h-5 w-5" />
              Launch SparkChat Free
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Download className="mr-2 h-5 w-5" />
              Install as App
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">8+</div>
              <div className="text-sm text-muted-foreground">AI Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Free</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-6">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No Registration Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>10 Free Credits Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Real-Time Streaming</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Mobile Optimized</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
