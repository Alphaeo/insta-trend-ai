import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

export default function Agency() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    budget: '',
    message: ''
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      budget: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/contact', {
        ...formData,
        subject: `New Contact Form Submission from ${formData.name}`,
        to: 'contact@kba.agency' // Email de destination
      });
      
      if (response.status === 200) {
        toast({
          title: "Message sent!",
          description: "We'll get back to you within 24-48 hours.",
          variant: "default"
        });
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          budget: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="rounded-2xl border-border h-14"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-foreground">Budget range *</Label>
                  <Select 
                    required
                    value={formData.budget}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="rounded-2xl border-border h-14">
                      <SelectValue placeholder="Select budget range">
                      {formData.budget ? `$${formData.budget.replace('-', ' - $')}` : 'Select budget range'}
                    </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5k-10k">$5K - $10K</SelectItem>
                      <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                      <SelectItem value="25k-50k">$25K - $50K</SelectItem>
                      <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                      <SelectItem value="100k+">$100K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="rounded-2xl border-border min-h-[200px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90 py-6 text-lg rounded-full disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : 'Submit'}
              </Button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
