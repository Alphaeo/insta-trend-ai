import { useState } from "react";
import { Sparkles, FileText, Image, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const agents = [
  {
    id: "strategist",
    name: "Strategist",
    icon: Sparkles,
    color: "bg-[#EC4899]",
    description: "builds strategy by asking discovery questions",
    greeting: "Hi! I'm your Content Strategist. What's your main goal — growth, engagement, or sales?",
    quickStarters: ["Define my 4 content pillars", "Map a 90-day growth plan", "Set KPIs & targets"]
  },
  {
    id: "content-manager",
    name: "Content Manager",
    icon: Calendar,
    color: "bg-[#A855F7]",
    description: "Creates a realistic content calendar and posting frequency.",
    greeting: "Hi! I'm your Content Manager. Let's build a sustainable posting schedule that works for you.",
    quickStarters: ["Create 30-day calendar", "Analyze best posting times", "Plan content themes"]
  },
  {
    id: "copywriter",
    name: "Copywriter",
    icon: FileText,
    color: "bg-[#3B82F6]",
    description: "Generates hooks, captions, scripts in your tone.",
    greeting: "Hi! I'm your Copywriter. Ready to create compelling copy that converts?",
    quickStarters: ["Write 10 post captions", "Generate hook variations", "Create script outline"]
  },
  {
    id: "picture-editor",
    name: "Picture Editor",
    icon: Image,
    color: "bg-[#10B981]",
    description: "Edits images, creates carousels, and generates visual content.",
    greeting: "Hi! I'm your Picture Editor. Let's create stunning visuals for your content.",
    quickStarters: ["Design carousel template", "Edit product photos", "Create branded graphics"]
  }
];

export default function Content() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">AI Content Agents</h1>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 mt-8">
          {/* Left Sidebar - Agent Selection */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Choose Your Agent</h2>
            <div className="space-y-4">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgent.id === agent.id;
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-6 rounded-3xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${agent.color} p-4 rounded-2xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {agent.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <p className="mt-4 text-foreground">
                        {agent.greeting}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side - Agent Details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`${selectedAgent.color} p-4 rounded-2xl`}>
                  {(() => {
                    const Icon = selectedAgent.icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {selectedAgent.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedAgent.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Quick Starters</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedAgent.quickStarters.map((starter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="rounded-full"
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
                <p className="text-foreground text-lg">{selectedAgent.greeting}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
