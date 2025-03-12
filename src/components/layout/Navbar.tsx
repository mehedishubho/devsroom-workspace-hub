
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300",
        scrolled 
          ? "bg-white/80 dark:bg-gray-950/80 shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
          >
            <Briefcase className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="font-semibold text-lg">Freelance Hub</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/" active={location.pathname === "/"}>
            Dashboard
          </NavLink>
          <NavLink href="/clients" active={location.pathname === "/clients"}>
            Clients
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ href, active, children }: NavLinkProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "relative py-1 font-medium text-sm hover:text-primary transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
};

export default Navbar;
