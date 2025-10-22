import { useState } from "react";
import { Search, Book, MessageCircle, Video, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const quickLinks = [
    {
      icon: Book,
      title: "Getting Started",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "AI Agents Guide",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FileText,
      title: "API Documentation",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const faqs = [
    "How do I get started with KBA?",
    "What AI agents are available?",
    "How accurate is the trending content data?",
    "Can I export my content and strategies?",
    "How do I contact support?",
  ];

  const videoTutorials = [
    {
      title: "Setting Up Your First Content Strategy",
      duration: "5 min",
      level: "Beginner",
      levelColor: "text-green-600",
    },
    {
      title: "Working with the Strategist AI Agent",
      duration: "8 min",
      level: "Beginner",
      levelColor: "text-green-600",
    },
    {
      title: "Advanced Content Calendar Planning",
      duration: "15 min",
      level: "Advanced",
      levelColor: "text-red-600",
    },
    {
      title: "Analyzing Trending Content Effectively",
      duration: "12 min",
      level: "Intermediate",
      levelColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Help & Support</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to your questions and learn how to make the most of KBA.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-4xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for help articles, FAQs, tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base rounded-2xl border-border bg-muted/50"
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card hover:bg-muted/50 transition-colors border border-border"
              >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                  <link.icon className="w-10 h-10 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">{link.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ and Video Tutorials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-2xl border border-border px-6 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-foreground font-medium py-6 hover:no-underline">
                    {faq}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Video Tutorials */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Video Tutorials</h2>
            <div className="space-y-4">
              {videoTutorials.map((tutorial, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-muted/50 transition-colors border border-border group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{tutorial.duration}</span>
                      <span className={tutorial.levelColor}>{tutorial.level}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-3xl p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Still Need Help?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our support team is here to help you succeed with KBA.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Start Live Chat
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-2 border-border hover:bg-muted"
            >
              Email Support
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-2 border-border hover:bg-muted"
            >
              Schedule Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
