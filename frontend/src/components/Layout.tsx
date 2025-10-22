import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, FileText, Info, Building2, Menu, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePopover from "@/components/ProfilePopover";

const navItems = [
  { path: "/", label: "Trends", icon: TrendingUp },
  { path: "/content", label: "Content", icon: FileText },
  { path: "/info", label: "Info", icon: Info },
  { path: "/agency", label: "Agency", icon: Building2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#EC4899] via-[#A855F7] to-[#3B82F6] shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-2xl font-bold">K</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">KBA</h1>
              <p className="text-white/90 text-sm">AI Social Media Personal Manager</p>
            </div>
          </div>
          <ProfilePopover />
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[82px] z-40 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`rounded-full px-6 py-6 transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-gradient-to-br from-primary to-accent text-white hover:opacity-90"
                onClick={() => navigate("/dashboard")}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full"
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-gradient-to-br hover:from-primary hover:to-accent"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
