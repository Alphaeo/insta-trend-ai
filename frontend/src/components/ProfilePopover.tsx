import { useState } from "react";
import { User, Crown, ChevronLeft, Bell, Moon, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = "profile" | "billing" | "accounts" | "settings";

export default function ProfilePopover() {
  const [view, setView] = useState<View>("profile");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const resetView = () => setView("profile");

  return (
    <Popover onOpenChange={(open) => !open && resetView()}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 rounded-full"
        >
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={12} avoidCollisions collisionPadding={16} className="w-[min(92vw,500px)] max-h-[90svh] p-0 rounded-3xl border-border">
        <ScrollArea className="h-[70svh]">
          {view === "profile" && (
            <div className="p-8 space-y-8">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#EC4899] to-[#A855F7] flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">@creative_creator</h3>
                <p className="text-muted-foreground">sarah.creator@email.com</p>
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 font-medium">Pro Member</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500">127</div>
                <div className="text-sm text-muted-foreground">Scripts Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">43</div>
                <div className="text-sm text-muted-foreground">Content Plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">89</div>
                <div className="text-sm text-muted-foreground">Images Created</div>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-pink-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-foreground">Current Plan: Pro</h4>
                  <p className="text-sm text-muted-foreground">
                    Unlimited AI generations and premium features
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600">$29<span className="text-sm">/mo</span></div>
                  <div className="text-xs text-muted-foreground">Next billing: Jan 15, 2025</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-2 border-pink-500 text-pink-600 hover:bg-pink-50"
                onClick={() => setView("billing")}
              >
                Manage Billing
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-border hover:bg-muted"
                onClick={() => setView("billing")}
              >
                View Plans
              </Button>
            </div>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-border space-y-2">
              <button
                onClick={() => setView("accounts")}
                className="w-full text-left text-foreground hover:text-primary transition-colors"
              >
                Connected accounts
              </button>
              <button
                onClick={() => setView("settings")}
                className="w-full text-left text-foreground hover:text-primary transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        )}

        {view === "billing" && (
          <div className="p-8 space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Usage This Month */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Usage This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">AI Scripts</span>
                  <span className="font-medium">23/∞</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Image Generation</span>
                  <span className="font-medium">15/∞</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Content Plans</span>
                  <span className="font-medium">8/∞</span>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Pro Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-foreground">Unlimited AI generations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-foreground">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-foreground">Custom brand voice</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-2 border-pink-500 text-pink-600 hover:bg-pink-50"
              >
                💳 Manage Billing
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-border hover:bg-muted"
              >
                View Plans
              </Button>
            </div>
          </div>
        )}

        {view === "accounts" && (
          <div className="p-8 space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <h3 className="text-xl font-bold text-foreground">Connected accounts</h3>

            {/* Social Media Accounts */}
            <div className="space-y-4">
              {/* YouTube */}
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Y</span>
                  </div>
                  <span className="text-foreground font-medium">YouTube</span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8"
                >
                  Connect
                </Button>
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E1306C] to-[#A855F7] flex items-center justify-center">
                    <span className="text-white font-bold text-xl">I</span>
                  </div>
                  <span className="text-foreground font-medium">Instagram</span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8"
                >
                  Connect
                </Button>
              </div>

              {/* TikTok */}
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
                    <span className="text-white font-bold text-xl">T</span>
                  </div>
                  <span className="text-foreground font-medium">TikTok</span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-pink-500 text-pink-600 hover:bg-pink-50 px-8"
                >
                  Connect
                </Button>
              </div>
            </div>

            {/* Settings Link */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setView("settings")}
                className="w-full text-left text-foreground hover:text-primary transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        )}

        {view === "settings" && (
          <div className="p-8 space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <h3 className="text-xl font-bold text-foreground">Settings</h3>

            {/* Settings Options */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and content
                    </div>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Use dark theme for better viewing experience
                    </div>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Language</div>
                    <div className="text-sm text-muted-foreground">
                      Choose your preferred language
                    </div>
                  </div>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[180px] rounded-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Log Out Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </div>
        )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
