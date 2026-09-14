import React from "react";
import { PublicNavbar } from "./PublicNavbar.js";
import { PublicFooter } from "./PublicFooter.js";
import { FloatingContactHub } from "./FloatingContactHub.js";

interface PublicShellProps {
  children: React.ReactNode;
}

export const PublicShell: React.FC<PublicShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F3] text-slate-900 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Fixed Public Navbar */}
      <PublicNavbar />

      {/* Main Page Content with proper top padding to account for fixed navbar */}
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};
