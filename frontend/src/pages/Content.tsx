import { useEffect, useState } from "react";
import { Sparkles, FileText, Image, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

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
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDrafts = async () => {
    try {
      const res = await api.get("/drafts");
      setDrafts(res.data.items || []);
    } catch (e) {
      console.error("Failed to fetch drafts", e);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const saveDraft = async () => {
    if (!draftTitle.trim() && !draftContent.trim()) return;
    setSaving(true);
    try {
      await api.post("/drafts", {
        title: draftTitle,
        content: draftContent,
        agent_id: selectedAgent.id,
      });
      setDraftTitle("");
      setDraftContent("");
      fetchDrafts();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      await api.delete(`/drafts/${id}`);
      fetchDrafts();
    } catch (e) {
      alert("Failed to delete draft");
    }
  };

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

          {/* Right Side - Agent Details + Drafts */}
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

            {/* Drafts */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Drafts</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Input
                    placeholder="Draft title"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                  />
                  <Textarea
                    rows={6}
                    placeholder="Write your idea..."
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                  />
                  <Button
                    onClick={saveDraft}
                    disabled={saving || drafts.length >= 5}
                    className="rounded-full"
                  >
                    {drafts.length >= 5 ? "Limit reached (5)" : saving ? "Saving..." : "Save draft"}
                  </Button>
                  <p className="text-xs text-muted-foreground">Max 5 drafts per user.</p>
                </div>
                <div className="space-y-3">
                  {drafts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No drafts yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {drafts.map((d) => (
                        <div key={d._id} className="p-4 border border-border rounded-2xl">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{d.title || "Untitled"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(d.updated_at).toLocaleString()}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => deleteDraft(d._id)}>Delete</Button>
                          </div>
                          {d.content && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{d.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
