import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Play, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Embed from "@/components/ui/Embed";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const platforms = ["Instagram", "TikTok"];
const locations = ["All", "USA", "Korea", "Russia", "EU", "Brazil", "Japan", "India", "UK"];
const niches = ["All", "Beauty", "Sports", "Design", "Style", "Korean", "Marketing", "Tech", "Food", "Travel", "Fitness"];

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
function AutoPlayVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      className="w-full h-full object-cover"
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

interface Reel {
  _id: string;
  reel_id: string;
  media_url: string;
  embed_html?: string;
  caption?: string;
  views: number;
  likes: number;
  origin: string;
  processed?: boolean;
  thumbnail?: string;
  s3_video?: string;
  created_at?: string;
}

export default function Trends() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set<string>());
  const [saving, setSaving] = useState(false);

  const extractTargetUrl = (embedHtml?: string, mediaUrl?: string) => {
    if (embedHtml) {
      const match = embedHtml.match(/href=\"([^\"]+)\"/);
      if (match && match[1]) return match[1];
    }
    return mediaUrl || undefined;
  };

  const resolveMediaUrl = (value?: string) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${API_URL}${normalized}`;
  };

  const fetchReels = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: '20',
        ...(selectedPlatform && { platform: selectedPlatform }),
        ...(selectedLocation && selectedLocation !== 'All' && { location: selectedLocation }),
        ...(selectedNiche && selectedNiche !== 'All' && { niche: selectedNiche })
      });
      
      const response = await fetch(`${API_URL}/trends/top?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }
      
      const data = await response.json();
      setReels(data.items || []);
      setSavedReels((prevSavedReels) => new Set<string>(data.savedReels || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Error loading reels",
        description: "Failed to fetch trending reels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if reels are saved when component mounts or when reels change
  useEffect(() => {
    const checkSavedReels = async () => {
      try {
        const response = await fetch(`${API_URL}/user/saved-reels`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const savedIds = new Set(data.items.map((r: any) => r.reel_id));
          setSavedReels(savedIds);
        }
      } catch (error) {
        console.error('Error fetching saved reels:', error);
      }
    };

    fetchReels();
    checkSavedReels();
  }, [selectedPlatform, selectedLocation, selectedNiche]);

  const toggleSaveReel = async (reel: Reel) => {
    if (saving) return;
    
    try {
      setSaving(true);
      const isSaved = savedReels.has(reel.reel_id);
      
      // Prevent default behavior that might be interfering with the click
      const event = window.event;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (isSaved) {
        // Unsave
        const response = await fetch(`${API_URL}/user/saved-reels/${reel.reel_id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          setSavedReels(prev => {
            const newSet = new Set<string>(prev);
            newSet.delete(reel.reel_id);
            return newSet;
          });
          toast({
            title: "Removed from saved",
            description: "Reel has been removed from your saved items.",
          });
        }
      } else {
        // Save
        const reelData = {
          reel_id: reel.reel_id,
          platform: selectedPlatform,
          location: selectedLocation === 'All' ? '' : selectedLocation,
          niche: selectedNiche === 'All' ? '' : selectedNiche,
          media_url: reel.media_url,
          caption: reel.caption,
          views: reel.views,
          likes: reel.likes,
          embed_html: reel.embed_html
        };
        
        const response = await fetch(`${API_URL}/user/saved-reels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(reelData),
        });
        
        if (response.ok) {
          setSavedReels(prev => new Set<string>([...prev, reel.reel_id]));
          toast({
            title: "Saved to your dashboard",
            description: "You can find this reel in your saved items.",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to update saved reels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Filters */}
      <div className="space-y-6">
        {/* Platform filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-foreground font-medium min-w-[100px]">Platform:</span>
          <div className="flex gap-2">
            {platforms.map((platform) => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? "default" : "ghost"}
                onClick={() => setSelectedPlatform(platform)}
                className={`rounded-full px-6 transition-all ${
                  selectedPlatform === platform
                    ? "bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>

        {/* Location filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-foreground font-medium min-w-[100px]">Location:</span>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px] rounded-full border-border">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Niche filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-foreground font-medium min-w-[100px]">Niche:</span>
          <div className="flex gap-2 flex-wrap">
            {niches.map((niche) => (
              <Button
                key={niche}
                variant={selectedNiche === niche ? "default" : "ghost"}
                onClick={() => setSelectedNiche(niche)}
                className={`rounded-full px-6 transition-all ${
                  selectedNiche === niche
                    ? "bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {niche}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="mt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchReels} variant="outline">
              Try Again
            </Button>
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No reels found. Upload some reels from the Dashboard!</p>
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reels.map((reel) => {
              const targetUrl = extractTargetUrl(reel.embed_html, reel.media_url);
              const videoSrc =
                resolveMediaUrl(reel.s3_video) ||
                (reel.media_url && /\.mp4($|\?)/i.test(reel.media_url) ? reel.media_url : null);
              const thumbnailSrc = resolveMediaUrl(reel.thumbnail);
              const showEmbed = !videoSrc && !!reel.embed_html;
              return (
              <Card key={reel._id} className="group overflow-hidden rounded-3xl border border-border bg-card w-full max-w-[320px] mx-auto">
                <CardContent className="p-0">
                  <div className="relative aspect-[9/16] bg-black max-h-[520px] md:max-h-[420px]">
                    {videoSrc ? (
                      <AutoPlayVideo src={videoSrc} poster={thumbnailSrc || undefined} />
                    ) : showEmbed ? (
                      <Embed
                        embedHtml={reel.embed_html}
                        type="instagram"
                        className="h-full w-full [&>blockquote]:!m-0"
                        fallback={
                          thumbnailSrc ? (
                            <img 
                              src={thumbnailSrc} 
                              alt={reel.caption || 'Reel thumbnail'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                              <Play className="w-12 h-12 text-neutral-500" />
                            </div>
                          )
                        }
                      />
                    ) : thumbnailSrc ? (
                      <img 
                        src={thumbnailSrc} 
                        alt={reel.caption || 'Reel thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <Play className="w-12 h-12 text-neutral-500" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white border-0">
                        {reel.origin}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative z-30 rounded-full w-10 h-10 ${savedReels.has(reel.reel_id) ? 'bg-primary/20 hover:bg-primary/30 text-primary' : 'bg-black/60 hover:bg-black/80 text-white'} backdrop-blur-sm flex items-center justify-center`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveReel(reel);
                        }}
                        disabled={saving}
                      >
                        {savedReels.has(reel.reel_id) ? (
                          <BookmarkCheck className="w-5 h-5 fill-current" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </Button>
                      {reel.caption && (
                        <DropdownMenu
                          open={openDropdownId === reel._id}
                          onOpenChange={(open) => setOpenDropdownId(open ? reel._id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative z-30 rounded-full w-10 h-10 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === reel._id ? null : reel._id);
                              }}
                            >
                              <MessageSquare className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end"
                            className="w-80 p-0 border-0 shadow-lg rounded-xl overflow-hidden bg-black/80 backdrop-blur-sm"
                            onInteractOutside={(e) => {
                              e.preventDefault();
                              setOpenDropdownId(null);
                            }}
                          >
                            <div className="p-4">
                              <p className="text-sm text-white/90 whitespace-pre-line">
                                {reel.caption}
                              </p>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {targetUrl && !videoSrc && (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        aria-label="Open reel"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    {reel.caption && (
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {reel.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(reel.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(reel.likes)}</span>
                      </div>
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-xs font-medium text-primary hover:underline"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
