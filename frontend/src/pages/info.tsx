import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const events = [
  {
    id: 1,
    type: "Call",
    typeColor: "bg-green-500",
    title: "Content Strategy Masterclass",
    date: "Oct 15",
    time: "2:00 PM EST",
    description: "Deep dive into content planning, audience research, and strategy frameworks that drive results.",
    action: "Join"
  },
  {
    id: 2,
    type: "Meetup",
    typeColor: "bg-blue-500",
    title: "Creator Meetup - NYC",
    date: "Oct 22",
    time: "6:00 PM EST",
    location: "Manhattan, NYC",
    description: "Network with fellow creators, share insights, and collaborate on new projects.",
    action: "RSVP"
  },
  {
    id: 3,
    type: "Community Session",
    typeColor: "bg-purple-500",
    title: "Weekly Community Check-in",
    date: "Oct 25",
    time: "12:00 PM EST",
    description: "Weekly session to discuss challenges, wins, and get feedback from the community.",
    action: "Join"
  },
  {
    id: 4,
    type: "Call",
    typeColor: "bg-green-500",
    title: "Viral Content Workshop",
    date: "Nov 1",
    time: "3:00 PM EST",
    description: "Learn the psychology behind viral content and how to create posts that spread.",
    action: "Join"
  }
];

const contentTypes = ["All", "Video", "Article", "Infographic", "Podcast"];
const topics = ["Strategy", "Content Creation", "Growth", "Analytics", "Trends", "Personal Branding", "Monetization", "Psychology"];

export default function Info() {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Events Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Upcoming Events</h1>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-card border border-border rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${event.typeColor}`} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {event.type}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-foreground">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{event.time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm">
                  {event.description}
                </p>

                <Button className="w-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90">
                  {event.action}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Content Library Section */}
        <section>
          <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
              {/* Type Filter */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-foreground font-medium">Type:</span>
                <div className="flex gap-2 flex-wrap">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-6 py-2 rounded-full border transition-all ${
                        selectedType === type
                          ? "bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white border-transparent"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-foreground font-medium">Topic:</span>
                <div className="flex gap-2 flex-wrap">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                      className={`px-6 py-2 rounded-full border transition-all ${
                        selectedTopic === topic
                          ? "bg-primary/10 text-primary border-primary"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <span className="text-foreground font-medium">Sort:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most recent</SelectItem>
                    <SelectItem value="popular">Most popular</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Grid Placeholder */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="aspect-video bg-muted rounded-2xl flex items-center justify-center"
                >
                  <span className="text-muted-foreground">Content {item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
