import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Agency() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A8516E] via-[#8B5A9F] to-[#5B7FB8] opacity-90" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            KBA Agency — Branding, Social, Design
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Strategy, identity, growth. Done with taste — and data.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Brand Strategy */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Brand Strategy</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We define your brand's core identity, positioning, and messaging strategy. From competitive 
              analysis to brand architecture, we lay the foundation for everything that follows.
            </p>
          </div>

          {/* Reels Production */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Reels Production</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              End-to-end video content creation from concept to final cut. We produce scroll-stopping 
              Reels that drive engagement and convert viewers into customers.
            </p>
          </div>

          {/* Visual Identity */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Visual Identity</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Logo design, color systems, typography, and brand guidelines that work across all 
              touchpoints. We create cohesive visual languages that tell your story.
            </p>
          </div>

          {/* Website/No-Code */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Website/No-Code</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Beautiful, conversion-optimized websites built on modern no-code platforms. Fast 
              turnaround, easy maintenance, and designed for growth.
            </p>
          </div>

          {/* Social Growth */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Social Growth</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Data-driven social media strategies that build engaged communities. We handle content 
              planning, audience development, and growth optimization across platforms.
            </p>
          </div>

          {/* AI for Marketing */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">AI for Marketing</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Custom AI solutions for content creation, audience analysis, and marketing automation. 
              We help you leverage cutting-edge technology for competitive advantage.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Let's work together</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Tell us about your project and we'll get back to you within 24-48 hours.
          </p>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90 px-8 py-6 text-lg rounded-full"
          >
            {showForm ? "Hide Form" : "Get Started"}
          </Button>
        </div>
      </section>

      {/* Contact Form */}
      {showForm && (
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    className="rounded-2xl border-border h-14"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="rounded-2xl border-border h-14"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Company (optional)</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    className="rounded-2xl border-border h-14"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-foreground">Budget range *</Label>
                  <Select required>
                    <SelectTrigger className="rounded-2xl border-border h-14">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5k-10k">$5K - $10K</SelectItem>
                      <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                      <SelectItem value="25k-50k">$25K - $50K</SelectItem>
                      <SelectItem value="50k+">$50K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="rounded-2xl border-border min-h-[200px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90 py-6 text-lg rounded-full"
              >
                Submit
              </Button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
