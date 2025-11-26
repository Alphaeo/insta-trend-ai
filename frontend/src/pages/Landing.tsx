import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-16 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-12">
            Choose Your Path to Social Media Success
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Academy Option */}
            <div className="p-8 rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Academy</h2>
              <p className="text-muted-foreground mb-6">
                Access our premium content platform with AI-powered tools to analyze trends, create content, and grow your audience.
              </p>
              <Link to="/auth">
                <Button className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white">
                  Sign In to Academy
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-3">
                Requires authentication. Subscription required for full access.
              </p>
            </div>
            
            {/* Agency Option */}
            <div className="p-8 rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Agency</h2>
              <p className="text-muted-foreground mb-6">
                Let our expert team manage your social media presence with tailored strategies and professional content creation.
              </p>
              <Link to="/agency" className="block w-full">
                <Button variant="outline" className="w-full">
                  Learn About Our Agency
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-3">
                No login required. Explore our services and get in touch.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


