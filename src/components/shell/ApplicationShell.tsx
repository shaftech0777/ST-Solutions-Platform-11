import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar.js";
import { Header } from "./Header.js";
import { Drawer } from "../ui/Modal.js";
import { CommandSearch } from "../ui/Breadcrumbs.js";
import { useAuth } from "../../context/AuthContext.js";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button.js";

export const ApplicationShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

  // If on login or register screen, render full screen auth layout
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">{children}</div>;
  }

  // Display clean branded loading splash during initial credential verification
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <img src="/favicon.svg" alt="ST-Solutions Loading" className="w-16 h-16 animate-pulse" />
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Authenticating ST-Solutions secure session...</span>
        </div>
      </div>
    );
  }

  // If user explicitly logged out or unauthenticated, display authentication required screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-[#D4AF37] shadow-xl"><ShieldAlert className="w-8 h-8" /></div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please sign in to access enterprise workspaces, clients, projects, and pipeline telemetry.
          </p>
        </div>
        <Link to="/login">
          <Button variant="primary" leftIcon={<LogIn className="w-4 h-4" />}>
            Sign In to ST-Solutions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      <Drawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="ST-SOLUTIONS"
      >
        <div onClick={() => setIsMobileSidebarOpen(false)}>
          <Sidebar isCollapsed={false} onToggleCollapse={() => setIsMobileSidebarOpen(false)} />
        </div>
      </Drawer>

      {/* Main App Layout Container */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandSearch={() => setIsCommandSearchOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Cmd+K Global Command Search Modal */}
      <CommandSearch
        isOpen={isCommandSearchOpen}
        onClose={() => setIsCommandSearchOpen(false)}
      />
    </div>
  );
};

