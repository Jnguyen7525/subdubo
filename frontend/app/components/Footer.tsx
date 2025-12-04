// Footer.tsx
// Simple footer for demo project — clean, minimal, and focused

import { Copyright } from "lucide-react";
import React from "react";

function Footer() {
  return (
    <footer className="w-full px-6 py-4 bg-white text-[#121435] text-sm flex flex-col sm:flex-row items-center justify-between border-t">
      <div className="flex items-center space-x-2">
        <Copyright className="w-4 h-4" />
        <span>© 2025 Subdubo</span>
      </div>
      <div className="text-xs sm:text-sm text-center sm:text-right">
        Built for demo purposes — translation powered by SMall-100
      </div>
    </footer>
  );
}

export default Footer;
