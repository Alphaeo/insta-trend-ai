import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, FileText, Info, Building2, Menu, HelpCircle, Settings, LayoutDashboard, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePopover from "@/components/ProfilePopover";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/I18nContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

// Navigation items - Main navigation (shown in the main bar)
const mainNavItems = [
  { path: "/trends", label: "Trends", icon: TrendingUp, requireAdmin: false },
  { path: "/content", label: "Content", icon: FileText, requireAdmin: false },
  { path: "/info", label: "Info", icon: Info, requireAdmin: false },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requireAdmin: false },
  { path: "/admin", label: "Admin", icon: Shield, requireAdmin: true },
];

// Additional menu items (shown in the dropdown menu)
const extraMenuItems = [
  { path: "/agency", label: "Agency", icon: Building2, requireAdmin: false },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Filter navigation items based on user role
  const navItems = mainNavItems.filter(item => !item.requireAdmin || (item.requireAdmin && isAdmin));
  const filteredExtraItems = extraMenuItems.filter(item => !item.requireAdmin || (item.requireAdmin && isAdmin));

  const handleNavClick = (path: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate(path);
  };

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
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ProfilePopover />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Main app links */}
                <DropdownMenuItem onClick={() => handleNavClick("/chat")}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </DropdownMenuItem>
                
                {/* Extra menu items */}
                {filteredExtraItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
                
                <DropdownMenuSeparator />
                
                {/* Settings and help */}
                <DropdownMenuItem onClick={() => handleNavClick("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick("/help")}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className={`rounded-full px-6 py-6 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white hover:opacity-90"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
