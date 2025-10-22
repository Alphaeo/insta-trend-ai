import { useState } from "react";
import { User, Bell, Shield, Palette, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Plan & Billing", icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Manage your account preferences and application settings.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid lg:grid-cols-[350px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-3xl p-8">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground">
                Profile Settings
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    defaultValue="Alex Johnson"
                    className="rounded-2xl border-border h-14"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="alex@example.com"
                    className="rounded-2xl border-border h-14"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  defaultValue="Content creator focused on productivity and lifestyle"
                  className="rounded-2xl border-border min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-foreground">
                  Timezone
                </Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger className="rounded-2xl border-border h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                    <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="utc+0">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="utc+1">UTC+1 (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 px-8 py-6 text-lg rounded-full">
                💾 Save Changes
              </Button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Notification Preferences
              </h2>
              <p className="text-muted-foreground">
                Configure how you receive notifications.
              </p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Privacy & Security
              </h2>
              <p className="text-muted-foreground">
                Manage your privacy and security settings.
              </p>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Appearance
              </h2>
              <p className="text-muted-foreground">
                Customize the look and feel of your application.
              </p>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Plan & Billing
              </h2>
              <p className="text-muted-foreground">
                Manage your subscription and billing information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
