
import React from "react";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-border bg-background py-6">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-muted-foreground text-sm">
          Copyright © {currentYear} Devsroom | Developed by{" "}
          <a 
            href="https://wpmhs.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            aria-label="Visit MHS Website"
          >
            MHS
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
