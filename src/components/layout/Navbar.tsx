
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building, ChevronDown, Clipboard, Home, LogOut, Menu, Settings, User, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import AppLogo from "@/components/ui-custom/AppLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If not authenticated, show minimal navbar
  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 h-16 px-4 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="container max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <AppLogo />
          </Link>
        </div>
      </nav>
    );
  }

  // Navigation items
  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/projects", label: "All Projects", icon: <Clipboard className="h-4 w-4" /> },
    { href: "/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
    { href: "/companies", label: "Companies", icon: <Building className="h-4 w-4" /> },
  ];

  // For mobile
  if (isMobile) {
    return (
      <nav className="fixed top-0 left-0 right-0 h-16 px-4 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="container max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <AppLogo />
          </Link>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px]">
              <div className="mt-8 flex flex-col gap-4">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "justify-start gap-2",
                      location.pathname === item.href && "bg-[#626eff]/10 text-[#626eff]"
                    )}
                    onClick={() => {
                      navigate(item.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
                <DropdownMenuSeparator />
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2"
                  onClick={() => {
                    navigate("/account");
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4" />
                  Account
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2"
                  onClick={() => {
                    navigate("/project-settings");
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2 text-destructive"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    );
  }

  // For desktop
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 px-4 bg-background/80 backdrop-blur-md border-b border-border z-30">
      <div className="container max-w-7xl mx-auto h-full flex items-center">
        <div className="flex-1">
          <Link to="/" className="flex items-center">
            <AppLogo />
          </Link>
        </div>

        <div className="flex-1 flex justify-center items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "gap-2 hover:text-[#626eff] hover:bg-[#626eff]/10",
                location.pathname === item.href && "bg-[#626eff]/10 text-[#626eff]"
              )}
            >
              <Link to={item.href}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:text-[#626eff] hover:bg-[#626eff]/10">
                <User className="h-4 w-4" />
                Account
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/account")} className="hover:text-[#626eff] hover:bg-[#626eff]/10">
                <User className="h-4 w-4 mr-2" />
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/project-settings")} className="hover:text-[#626eff] hover:bg-[#626eff]/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
