import React from "react";
import {
  ShoppingBag,
  Pill,
  Utensils,
  LayoutDashboard,
  Bot,
  GraduationCap,
  Boxes,
  Calendar,
  Users,
  Globe,
  CheckCircle2,
  TrendingUp,
  Clock,
  Shield,
  Smartphone,
  CreditCard,
} from "lucide-react";

interface ProjectCardVisualProps {
  projectId: string;
  category?: string;
}

export const ProjectCardVisual: React.FC<ProjectCardVisualProps> = ({ projectId, category }) => {
  // Apex E-Commerce
  if (projectId.includes("ecommerce") || projectId.includes("retail") || category === "E-Commerce") {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Apex Storefront</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            Instant Checkout
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium">Active Cart (3 items)</span>
            <span className="font-mono text-amber-400 font-bold">$149.00</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CreditCard className="w-3 h-3" />
              <span>Stripe / Cards</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <Smartphone className="w-3 h-3" />
              <span>WhatsApp Alerts</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Real-time SKU Stock Sync</span>
          <span className="text-amber-400 font-semibold">99.9% Uptime</span>
        </div>
      </div>
    );
  }

  // Medix Pharmacy
  if (projectId.includes("pharmacy") || projectId.includes("medix")) {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Medix Pharmacy POS</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            Expiry Alert Engine
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span>Amoxicillin 500mg (Batch #B92)</span>
            <span className="text-emerald-400 font-mono font-bold">120 In Stock</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Barcode Scanned &amp; Verified</span>
            <span className="text-slate-300 font-medium">Exp: Nov 2027</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="text-emerald-400 font-medium">Counter POS: &lt; 15s Billing</span>
          <span>Prescription Vault Active</span>
        </div>
      </div>
    );
  }

  // BistroOrder Restaurant
  if (projectId.includes("bistro") || projectId.includes("restaurant") || projectId.includes("food")) {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">BistroOrder POS &amp; QR</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            0% Commission
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-white">Table 04 • Live KDS Ticket</span>
            <span className="text-amber-400 font-mono text-[10px]">12 min active</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>2x Artisan Burger + Truffle Fries</span>
            <span className="text-emerald-400 font-medium">Kitchen Notified</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>QR Digital Table Menu</span>
          <span className="text-white font-medium">Thermal Print Ready</span>
        </div>
      </div>
    );
  }

  // Pulse Operations & CRM
  if (projectId.includes("pulse") || projectId.includes("operations") || projectId.includes("crm")) {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Pulse Operations Hub</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
            CRM &amp; Invoices
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-center">
            <div className="text-[9px] text-slate-400">PIPELINE</div>
            <div className="text-xs font-bold text-white">$48.5k</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-center">
            <div className="text-[9px] text-slate-400">ACTIVE</div>
            <div className="text-xs font-bold text-amber-400">14 Deals</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-center">
            <div className="text-[9px] text-slate-400">PAID</div>
            <div className="text-xs font-bold text-emerald-400">99.2%</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Spreadsheet Replacement</span>
          <span className="text-amber-400 font-medium">Auto PDF Invoicing</span>
        </div>
      </div>
    );
  }

  // OmniBot AI Assistant
  if (projectId.includes("ai") || projectId.includes("bot") || category === "AI") {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">OmniBot AI Assistant</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            24/7 Live
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5 text-[10px]">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">Customer: &quot;What are your pricing packages?&quot;</span>
          </div>
          <div className="text-amber-300 bg-purple-950/40 border border-purple-800/40 p-1.5 rounded-lg">
            OmniBot: &quot;We offer 3 packages starting from $499. Would you like a brochure on WhatsApp?&quot;
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Website &amp; WhatsApp Sync</span>
          <span className="text-purple-300 font-semibold">&lt; 2s First Response</span>
        </div>
      </div>
    );
  }

  // EduSphere School Portal
  if (projectId.includes("edusphere") || projectId.includes("school") || projectId.includes("academic")) {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">EduSphere Portal</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-semibold border border-teal-500/30">
            Fee &amp; Grades Hub
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span className="font-semibold text-white">Monthly Fee Reconciliation</span>
            <span className="text-emerald-400 font-mono font-bold">94% Collected</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Automated SMS Voucher Sent</span>
            <span className="text-slate-300">420 Students</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Parent Mobile Portal</span>
          <span className="text-teal-400 font-medium">Digital Attendance</span>
        </div>
      </div>
    );
  }

  // StockFlow Inventory
  if (projectId.includes("inventory") || projectId.includes("stock") || projectId.includes("warehouse")) {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Boxes className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">StockFlow Inventory</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
            Multi-Branch
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span>Central Warehouse #01</span>
            <span className="text-indigo-300 font-mono">14,280 SKUs</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Low Stock Auto-PO Generator</span>
            <span className="text-emerald-400">Optimized</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Barcode / QR Scanner</span>
          <span className="text-white font-medium">99.4% Accuracy</span>
        </div>
      </div>
    );
  }

  // AppointEase Booking
  if (projectId.includes("booking") || projectId.includes("appointment") || category === "Automation") {
    return (
      <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">AppointEase Booking</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            -75% No-Shows
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span className="font-semibold text-white">Tomorrow • 10:30 AM</span>
            <span className="text-emerald-400 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>WhatsApp Reminder Sequence</span>
            <span className="text-slate-300">Google Calendar Synced</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>24/7 Self-Service Booking</span>
          <span className="text-amber-400 font-medium">Deposit Collected</span>
        </div>
      </div>
    );
  }

  // Default / Corporate Website
  return (
    <div className="w-full h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-700/60 shadow-inner group-hover:border-amber-500/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">Corporate Digital Platform</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
          100/100 PageSpeed
        </span>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-300">
          <span className="font-semibold text-white">High-Authority Architecture</span>
          <span className="text-amber-400 font-mono font-bold">&lt; 0.8s Load</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Technical SEO Optimization</span>
          <span className="text-emerald-400">Mobile-First UI</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Executive Authority Design</span>
        <span className="text-amber-400 font-medium">Lead Conversion Ready</span>
      </div>
    </div>
  );
};
