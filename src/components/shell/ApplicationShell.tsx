import React, { useState } from "react";
import { Sidebar } from "./Sidebar.js";
import { Header } from "./Header.js";
import { Drawer } from "../ui/Modal.js";
import { CommandSearch } from "../ui/Breadcrumbs.js";

export const ApplicationShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

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

