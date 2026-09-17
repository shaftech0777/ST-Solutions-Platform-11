import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Globe,
  Code2,
  Brain,
  Workflow,
  ShoppingBag,
  Cpu,
  Layers,
  Sparkles,
  UserPlus,
  LogIn,
  LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { servicesData } from "../../data/companyConfig.js";
import { usePublicCMS } from "../../context/PublicCMSContext.js";

export const PublicNavbar: React.FC = () => {
  const companyConfig = usePublicCMS();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);

  // Monitor scroll for subtle shadow/blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setIsSolutionsDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-[#F7F7F3]/90 backdrop-blur-sm border-b border-slate-200/60 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group" id="nav-brand-logo">
          <img src="/favicon.svg" alt="ST-Solutions Logo" className="w-9 h-9 shrink-0" /><img src="/st-solutions-logo.svg" alt="ST-Solutions" className="h-6 hidden sm:block dark:hidden" /><img src="/st-solutions-logo-dark.svg" alt="ST-Solutions" className="h-6 hidden sm:dark:block" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-700">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg transition-all ${
              isActive("/") && location.pathname === "/"
                ? "text-[#876F23] font-semibold bg-slate-100 border-b-2 border-[#876F23]"
                : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
            }`}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsServicesDropdownOpen(true)}
            onMouseLeave={() => setIsServicesDropdownOpen(false)}
          >
            <button
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                isActive("/services")
                  ? "text-[#876F23] font-semibold bg-slate-100 border-b-2 border-[#876F23]"
                  : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
              }`}
              onClick={() => navigate("/services")}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isServicesDropdownOpen ? "rotate-180 text-[#876F23]" : "text-slate-500 dark:text-slate-400"}`} />
            </button>

            {isServicesDropdownOpen && (
              <div className="absolute top-full left-0 w-72 pt-2 z-50 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    What We Build
                  </div>
                  <Link
                    to="/services#web-development"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Web Development</div>
                      <div className="text-[10px] text-slate-500">Corporate sites, portals & PWAs</div>
                    </div>
                  </Link>

                  <Link
                    to="/services#software-development"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Software Development</div>
                      <div className="text-[10px] text-slate-500">Custom business software & ERP</div>
                    </div>
                  </Link>

                  <Link
                    to="/services#ai-solutions"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">AI Solutions</div>
                      <div className="text-[10px] text-slate-500">LLMs, assistants & document AI</div>
                    </div>
                  </Link>

                  <Link
                    to="/services#business-automation"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#876F23] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Workflow className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Business Automation</div>
                      <div className="text-[10px] text-slate-500">Pipelines & event triggers</div>
                    </div>
                  </Link>

                  <Link
                    to="/services#e-commerce"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">E-Commerce</div>
                      <div className="text-[10px] text-slate-500">Storefronts & payment systems</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <Link
                      to="/services"
                      className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#876F23] hover:underline"
                    >
                      <span>Explore all services</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsSolutionsDropdownOpen(true)}
            onMouseLeave={() => setIsSolutionsDropdownOpen(false)}
          >
            <button
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-all ${
                isActive("/solutions")
                  ? "text-[#876F23] font-semibold bg-slate-100 border-b-2 border-[#876F23]"
                  : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
              }`}
              onClick={() => navigate("/solutions")}
            >
              <span>Solutions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSolutionsDropdownOpen ? "rotate-180 text-[#876F23]" : "text-slate-500 dark:text-slate-400"}`} />
            </button>

            {isSolutionsDropdownOpen && (
              <div className="absolute top-full left-0 w-72 pt-2 z-50 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    By Business Goal
                  </div>

                  <Link
                    to="/solutions?goal=build-platform"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Business Platforms</div>
                      <div className="text-[10px] text-slate-500">Custom portals & client hubs</div>
                    </div>
                  </Link>

                  <Link
                    to="/solutions?goal=automate-business"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#876F23] flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">AI & Automation</div>
                      <div className="text-[10px] text-slate-500">Streamline repetitive workflows</div>
                    </div>
                  </Link>

                  <Link
                    to="/solutions?goal=sell-online"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">E-Commerce Solutions</div>
                      <div className="text-[10px] text-slate-500">Storefronts & inventory sync</div>
                    </div>
                  </Link>

                  <Link
                    to="/solutions?goal=build-custom"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Custom Engineering</div>
                      <div className="text-[10px] text-slate-500">Tailored proprietary systems</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <Link
                      to="/solutions"
                      className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#876F23] hover:underline"
                    >
                      <span>Explore all solutions</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/projects"
            className={`px-3.5 py-2 rounded-lg transition-all ${
              isActive("/projects")
                ? "text-[#876F23] font-semibold bg-slate-100 border-b-2 border-[#876F23]"
                : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
            }`}
          >
            Projects
          </Link>

          <Link
            to="/about"
            className={`px-3.5 py-2 rounded-lg transition-all ${
              isActive("/about")
                ? "text-[#876F23] font-semibold bg-slate-100 border-b-2 border-[#876F23]"
                : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
            }`}
          >
            About
          </Link>

          <Link
            to="/contact"
            className={`px-3.5 py-2 rounded-lg transition-all ${
              isActive("/contact")
                ? "text-[#876F23] font-semibold border-b-2 border-[#876F23]"
                : "hover:text-slate-950 hover:bg-slate-100 border-b-2 border-transparent"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#876F23]" />
              <span>Portal Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/start-project"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-transparent text-slate-900 font-semibold text-xs shadow-sm hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-300"
            id="nav-start-project-cta"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-2">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="p-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-900"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-lg text-xs font-semibold text-slate-700"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 shadow-2xl p-6 space-y-5 animate-fade-in max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-800">
            <Link
              to="/"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/") && location.pathname === "/" ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/services") ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              Services
            </Link>
            <Link
              to="/solutions"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/solutions") ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              Solutions
            </Link>
            <Link
              to="/projects"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/projects") ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              Projects
            </Link>
            <Link
              to="/about"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/about") ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`p-2.5 rounded-xl transition-all ${
                isActive("/contact") ? "bg-slate-100 font-bold text-[#876F23]" : ""
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <Link
              to="/start-project"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-transparent text-slate-900 font-semibold text-sm shadow-sm border border-slate-300 hover:bg-slate-50"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </Link>

            <Link
              to="/apply"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-[#876F23]" />
              <span>Member Application</span>
            </Link>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Direct WhatsApp:</span>
              <a
                href={companyConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#876F23] font-semibold"
              >
                {companyConfig.contact.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
