import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Users, Database, Calendar, BookOpen } from "lucide-react";
import api from "@/lib/api";
import Embed from "@/components/ui/Embed";
import { Button as UIButton } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [dbOverview, setDbOverview] = useState<Record<string, { count: number; recent: any[] }>>({});
  const [loading, setLoading] = useState(false);

  // Reel upload state
  const [reelForm, setReelForm] = useState({
    reel_id: "",
    media_url: "",
    caption: "",
    views: 0,
    likes: 0,
    embed_html: "", // <-- nouveau champ
    platform: "Instagram",
    location: "USA",
    niche: "All",
  });

  // Event upload state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "Call",
    tags: [] as string[],
    thumbnail: "",
  });

  // Lesson upload state
  const [lessonForm, setLessonForm] = useState({
    title: "",
    summary: "",
    file: null as File | null,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    fetchUsers();
    fetchReels();
    fetchEvents();
    fetchLessons();
    fetchDbOverview();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchReels = async () => {
    try {
      const res = await api.get("/reels");
      setReels(res.data);
    } catch (err) {
      console.error("Failed to fetch reels", err);
    }
  };

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
    }
  };

  const fetchDbOverview = async () => {
    try {
      const res = await api.get("/admin/db/overview");
      setDbOverview(res.data || {});
    } catch (err) {
      console.error("Failed to fetch DB overview", err);
    }
  };

  const handleReelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/trends/manual-ingest", reelForm);
      if (res.status === 200 || res.status === 201) {
        alert("Reel uploaded successfully!");
        setReelForm({
          reel_id: "",
          media_url: "",
          caption: "",
          views: 0,
          likes: 0,
          embed_html: "",
          platform: "Instagram",
          location: "USA",
          niche: "All",
        });
        fetchReels();
      }
    } catch (err) {
      console.error("Failed to upload reel", err);
      alert("Error uploading reel. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/events", eventForm);
      if (res.status === 200 || res.status === 201) {
        alert("Event uploaded successfully!");
        setEventForm({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          type: "Call",
          tags: [],
          thumbnail: "",
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to upload event", err);
      alert("Error uploading event. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.file) {
      alert("Please select a file to upload");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", lessonForm.file);
      formData.append("title", lessonForm.title);
      formData.append("summary", lessonForm.summary);
      if (lessonForm.thumbnail) {
        formData.append("thumbnail", lessonForm.thumbnail);
      }

      const res = await api.post("/lessons/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (res.status === 200 || res.status === 201) {
        alert("Lesson uploaded successfully!");
        setLessonForm({
          title: "",
          summary: "",
          file: null,
          thumbnail: null,
        });
        fetchLessons();
      }
    } catch (err) {
      console.error("Failed to upload lesson", err);
      alert("Error uploading lesson. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="users" className="px-4 py-2">
            Users
          </TabsTrigger>
          <TabsTrigger value="reels" className="px-4 py-2">
            Reels
          </TabsTrigger>
          <TabsTrigger value="events" className="px-4 py-2">
            Events
          </TabsTrigger>
          <TabsTrigger value="lessons" className="px-4 py-2">
            Lessons
          </TabsTrigger>
          <TabsTrigger value="database" className="px-4 py-2">
            Database
          </TabsTrigger>
        </TabsList>

        {/* 🧑 Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Registered Users
              </CardTitle>
              <CardDescription>Manage registered platform users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th>Email</th>
                      <th>Full Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td>{u.email}</td>
                        <td>{u.full_name}</td>
                        <td>{u.role}</td>
                        <td>{u.is_active ? "✅ Active" : "❌ Inactive"}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🎥 Reel Upload Tab */}
        <TabsContent value="reels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Reel to Trends
              </CardTitle>
              <CardDescription>
                Manually add a reel to the trends page for analysis and display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReelUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reel_id">Reel ID</Label>
                    <Input
                      id="reel_id"
                      value={reelForm.reel_id}
                      onChange={(e) =>
                        setReelForm((prev) => ({ ...prev, reel_id: e.target.value }))
                      }
                      placeholder="Enter unique reel ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media_url">Media URL</Label>
                    <Input
                      id="media_url"
                      value={reelForm.media_url}
                      onChange={(e) =>
                        setReelForm((prev) => ({ ...prev, media_url: e.target.value }))
                      }
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>

                {/* Trend keywords */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={reelForm.platform} onValueChange={(v) => setReelForm((p) => ({ ...p, platform: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={reelForm.location} onValueChange={(v) => setReelForm((p) => ({ ...p, location: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Korea">Korea</SelectItem>
                        <SelectItem value="Russia">Russia</SelectItem>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Niche</Label>
                    <Select value={reelForm.niche} onValueChange={(v) => setReelForm((p) => ({ ...p, niche: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Style">Style</SelectItem>
                        <SelectItem value="Korean">Korean</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={reelForm.caption}
                    onChange={(e) =>
                      setReelForm((prev) => ({ ...prev, caption: e.target.value }))
                    }
                    placeholder="Reel caption or description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embed_html">Embed HTML (optional)</Label>
                  <Textarea
                    id="embed_html"
                    value={reelForm.embed_html}
                    onChange={(e) =>
                      setReelForm((prev) => ({ ...prev, embed_html: e.target.value }))
                    }
                    placeholder="Paste Instagram embed code here"
                    rows={5}
                  />
                  {reelForm.embed_html && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Preview:</Label>
                      <div className="mt-1 border rounded p-2 bg-gray-50">
                        <Embed
                          embedHtml={reelForm.embed_html}
                          type="instagram"
                          className="max-w-sm"
                          fallback={
                            <div className="p-2 bg-gray-100 rounded text-xs text-gray-600">
                              Preview unavailable
                            </div>
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="views">Views</Label>
                    <Input
                      id="views"
                      type="number"
                      value={reelForm.views}
                      onChange={(e) =>
                        setReelForm((prev) => ({
                          ...prev,
                          views: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="likes">Likes</Label>
                    <Input
                      id="likes"
                      type="number"
                      value={reelForm.likes}
                      onChange={(e) =>
                        setReelForm((prev) => ({
                          ...prev,
                          likes: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white"
                >
                  {loading ? "Uploading..." : "Upload Reel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📅 Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upload Event
              </CardTitle>
              <CardDescription>
                Add new events that will be displayed on the Info page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_title">Event Title</Label>
                    <Input
                      id="event_title"
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type</Label>
                    <select
                      id="event_type"
                      value={eventForm.type}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Call">Call</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Community Session">Community Session</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_thumbnail">Thumbnail (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="event_thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        try {
                          const res = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
                          setEventForm((prev) => ({ ...prev, thumbnail: res.data.url }));
                        } catch (err) {
                          console.error("Failed to upload thumbnail", err);
                          alert("Thumbnail upload failed");
                        }
                      }}
                    />
                    {eventForm.thumbnail && (
                      <img src={eventForm.thumbnail} alt="thumb" className="h-12 w-12 object-cover rounded" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_description">Description</Label>
                  <Textarea
                    id="event_description"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Event description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_time">Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, time: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_location">Location (optional)</Label>
                    <Input
                      id="event_location"
                      value={eventForm.location}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white"
                >
                  {loading ? "Uploading..." : "Upload Event"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Events</CardTitle>
              <CardDescription>List of uploaded events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {events.map((event) => (
                  <div key={event._id} className="border p-3 rounded-md flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await api.delete(`/events/${event._id}`);
                          fetchEvents();
                        } catch (e) {
                          console.error('Failed to delete event', e);
                          alert('Failed to delete event');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📚 Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Upload Lesson
              </CardTitle>
              <CardDescription>
                Upload lesson files that will be available on the Info page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLessonUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson_title">Lesson Title</Label>
                  <Input
                    id="lesson_title"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson_summary">Summary</Label>
                  <Textarea
                    id="lesson_summary"
                    value={lessonForm.summary}
                    onChange={(e) =>
                      setLessonForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="Lesson summary or description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson_file">Lesson File</Label>
                  <Input
                    id="lesson_file"
                    type="file"
                    onChange={(e) =>
                      setLessonForm((prev) => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))
                    }
                    accept=".pdf,.doc,.docx,.txt,.mp4,.mp3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson_thumbnail">Lesson Thumbnail (optional)</Label>
                  <Input
                    id="lesson_thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setLessonForm((prev) => ({
                        ...prev,
                        thumbnail: e.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white"
                >
                  {loading ? "Uploading..." : "Upload Lesson"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Lessons</CardTitle>
              <CardDescription>List of uploaded lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="border p-3 rounded-md flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{lesson.title}</p>
                      <p className="text-sm text-gray-500">{lesson.summary}</p>
                      <a 
                        href={lesson.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Download File
                      </a>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(lesson.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await api.delete(`/lessons/${lesson._id}`);
                          fetchLessons();
                        } catch (e) {
                          console.error('Failed to delete lesson', e);
                          alert('Failed to delete lesson');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 💾 Database Overview */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Overview
              </CardTitle>
              <CardDescription>Collections, counts and recent items (last 10).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(dbOverview).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  Object.entries(dbOverview).map(([name, info]) => (
                    <div key={name} className="border border-border rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{name}</p>
                        <span className="text-xs text-muted-foreground">{info.count} documents</span>
                      </div>
                      <pre className="mt-3 text-xs bg-muted/50 rounded p-3 overflow-auto max-h-64">
{JSON.stringify(info.recent, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={fetchDbOverview}>Refresh</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

