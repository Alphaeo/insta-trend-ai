import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const platforms = ["Instagram", "TikTok"];
const locations = ["USA", "Korea", "Russia", "EU", "Brazil", "Japan", "India", "UK"];
const niches = ["All", "Beauty", "Sports", "Design", "Style", "Korean", "Marketing", "Tech", "Food", "Travel", "Fitness"];

const trendCards = [
  { id: 1, category: "Beauty", image: "beauty" },
  { id: 2, category: "Sports", image: "sports" },
  { id: 3, category: "Design", image: "design" },
  { id: 4, category: "Style", image: "style" },
];

export default function Trends() {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedLocation, setSelectedLocation] = useState("USA");
  const [selectedNiche, setSelectedNiche] = useState("All");

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
              <SelectValue />
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

      {/* Trend cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {trendCards.map((card) => (
          <div
            key={card.id}
            className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 group cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-lg">{card.category}</span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white px-4 py-2 rounded-full text-sm font-medium">
                {card.category}
              </span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
