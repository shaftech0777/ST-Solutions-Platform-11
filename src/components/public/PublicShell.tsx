import React from "react";
import { PublicNavbar } from "./PublicNavbar.js";
import { PublicFooter } from "./PublicFooter.js";
import { FloatingContactHub } from "./FloatingContactHub.js";

interface PublicShellProps {
  children: React.ReactNode;
}

export const PublicShell: React.FC<PublicShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Fixed Public Navbar */}
      <PublicNavbar />

      {/* Main Page Content with proper top padding to account for fixed navbar */}
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>

      {/* Floating Direct Contact Actions */}
      <FloatingContactHub />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};
