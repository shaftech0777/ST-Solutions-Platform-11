const fs = require('fs');
const file = 'src/components/shell/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const newHeaderAndContext = `
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <img src="/st-solutions-logo.svg" alt="ST-Solutions" className="h-6 dark:hidden" />
          )}
          {!isCollapsed && (
            <img src="/st-solutions-logo-dark.svg" alt="ST-Solutions" className="h-6 hidden dark:block" />
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors hidden lg:flex items-center justify-center"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tenant Context Chip (When Expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                Organization
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentOrganization?.name || "Shaf Tech Solutions"}
              </div>
              {currentWorkspace && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  ↳ {currentWorkspace.name}
                </div>
              )}
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              {currentUser?.accountType || "ADMIN"}
            </span>
          </div>
        </div>
      )}
`;

content = content.replace(/\{\/\* Brand Header \*\/\}[\s\S]*?\{\/\* Navigation Links \*\/\}/, newHeaderAndContext + '\n      {/* Navigation Links */}');

fs.writeFileSync(file, content);
console.log("Restored Sidebar.tsx");
