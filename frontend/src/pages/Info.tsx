import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

const contentTypes = ["All", "Video", "Article", "Infographic", "Podcast"];
const topics = ["Strategy", "Content Creation", "Growth", "Analytics", "Trends", "Personal Branding", "Monetization", "Psychology"];

export default function Info() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [events, setEvents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const buildAssetUrl = (value?: string | null) => {
    if (!value) return null;
    // If it's already a full URL, return it
    if (/^https?:\/\//i.test(value)) return value;
    // If it starts with /files/, use API base URL
    if (value.startsWith("/files/")) {
      const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:8000";
      // Remove trailing slash
      const base = apiBase.replace(/\/$/, "");
      // In production, VITE_API_URL might be "/api", so we need to construct the full path
      if (base.startsWith("/")) {
        // Relative path (production)
        return `${base}${value}`;
      } else {
        // Absolute URL (development)
        return `${base}${value}`;
      }
    }
    // For backward compatibility, treat as relative path
    const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_URL || "http://localhost:8000";
    const base = apiBase.replace(/\/$/, "");
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${base}${normalized}`;
  };

  useEffect(() => {
    fetchEvents();
    fetchLessons();
    fetchRegisteredEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get("/lessons");
      setLessons(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await api.get("/events/registrations/me");
      setRegisteredEvents(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch registered events", err);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      await api.post(`/events/${eventId}/join`);
      await Promise.all([fetchRegisteredEvents(), fetchEvents()]);
    } catch (err: any) {
      console.error("Failed to join event", err);
      alert(err?.response?.data?.detail || "Failed to join event");
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Call":
        return "bg-green-500";
      case "Meetup":
        return "bg-blue-500";
      case "Community Session":
        return "bg-purple-500";
      case "Workshop":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatEventDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatEventTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString;
  };

  const registeredEventIds = useMemo(() => new Set(registeredEvents.map((ev: any) => ev._id)), [registeredEvents]);

  const leaveEvent = async (eventId: string) => {
    try {
      await api.delete(`/events/${eventId}/leave`);
      await Promise.all([fetchRegisteredEvents(), fetchEvents()]);
    } catch (err: any) {
      console.error("Failed to leave event", err);
      alert(err?.response?.data?.detail || "Failed to leave event");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Registered events sidebar - fixed width */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">My Events</h2>
            {registeredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No registrations yet.</p>
            ) : (
              <ul className="space-y-3">
                {registeredEvents.map((ev: any) => (
                  <li key={ev._id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getEventTypeColor(ev.type)}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">{ev.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formatEventDate(ev.date)}</span>
                        </div>
                        {ev.location && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => leaveEvent(ev._id)}
                    >
                      Unsubscribe
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Events Section */}
          <section className="mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Upcoming Events</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-card border border-border rounded-3xl overflow-hidden"
                >
                  {event.thumbnail && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img 
                        src={buildAssetUrl(event.thumbnail) || 'https://via.placeholder.com/400x225?text=Image+Not+Available'} 
                        alt={event.title} 
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/400x225?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
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
                        <span>{formatEventDate(event.date)}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{formatEventTime(event.time)}</span>
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

                    <Button 
                      className="w-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90"
                      onClick={() => joinEvent(event._id)}
                      disabled={registeredEventIds.has(event._id)}
                    >
                      {registeredEventIds.has(event._id) ? "Registered" : "Join"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lessons Section */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Learning Resources</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No lessons available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => navigate(`/lesson/${lesson._id}`)}
                >
                  {lesson.thumbnail ? (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img 
                        src={buildAssetUrl(lesson.thumbnail) || 'https://via.placeholder.com/400x225?text=Thumbnail+Not+Available'} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/400x225?text=Thumbnail+Not+Available';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-600">No thumbnail</span>
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Lesson
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {lesson.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </span>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lesson/${lesson._id}`);
                        }}
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
