export const TOKENS = {
  colors: {
    // Primary Gold Accent Suite (Brand Identity)
    gold: {
      light: "#E5C158",
      DEFAULT: "#D4AF37",
      dark: "#B88E20",
      hover: "#C59B27",
      active: "#9E7818",
      subtle: "rgba(212, 175, 55, 0.12)",
      border: "rgba(212, 175, 55, 0.3)",
      glow: "rgba(212, 175, 55, 0.25)",
    },
    // Technology Blue Secondary Accent
    blue: {
      DEFAULT: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      subtle: "rgba(37, 99, 235, 0.1)",
      border: "rgba(37, 99, 235, 0.25)",
    },
    // Dark Surfaces (Intentional Contrast Blocks, CTA, Footer, Architecture Visuals)
    dark: {
      bg: "#111827",
      surface: "#1F2937",
      surfaceElevated: "#0B1220",
      border: "#374151",
      borderStrong: "#4B5563",
      borderSubtle: "#1F2937",
      textPrimary: "#FFFFFF",
      textSecondary: "#D1D5DB",
      textMuted: "#9CA3AF",
      overlay: "rgba(11, 18, 32, 0.8)",
    },
    // Light Theme Palette (Primary Public System)
    light: {
      bg: "#F7F7F3",
      surface: "#FFFFFF",
      surfaceElevated: "#F1F2EE",
      border: "#E2E5E0",
      borderStrong: "#CBD5E1",
      borderSubtle: "#ECEEE9",
      textPrimary: "#111827",
      textSecondary: "#4B5563",
      textMuted: "#6B7280",
      overlay: "rgba(17, 24, 39, 0.6)",
    },
    // Semantic States
    status: {
      success: {
        bg: "rgba(16, 185, 129, 0.1)",
        text: "#10B981",
        textLight: "#047857",
        border: "rgba(16, 185, 129, 0.25)",
      },
      warning: {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "#F59E0B",
        textLight: "#B45309",
        border: "rgba(245, 158, 11, 0.25)",
      },
      danger: {
        bg: "rgba(239, 68, 68, 0.1)",
        text: "#EF4444",
        textLight: "#B91C1C",
        border: "rgba(239, 68, 68, 0.25)",
      },
      info: {
        bg: "rgba(37, 99, 235, 0.1)",
        text: "#2563EB",
        textLight: "#1D4ED8",
        border: "rgba(37, 99, 235, 0.25)",
      },
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    sizes: {
      display: "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight",
      h1: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
      h2: "text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight",
      h3: "text-lg sm:text-xl font-semibold tracking-tight",
      h4: "text-base font-semibold",
      body: "text-sm font-normal leading-relaxed",
      bodySmall: "text-xs font-normal leading-normal",
      caption: "text-[11px] font-medium leading-tight",
      label: "text-xs font-semibold tracking-wider uppercase font-mono",
      metric: "text-2xl sm:text-3xl font-bold tracking-tight font-mono",
    },
  },
  radius: {
    xs: "rounded-sm",
    sm: "rounded-md",
    DEFAULT: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    full: "rounded-full",
  },
  shadows: {
    none: "none",
    subtle: "0 2px 8px -2px rgba(0, 0, 0, 0.05)",
    medium: "0 4px 16px -4px rgba(0, 0, 0, 0.08)",
    elevated: "0 10px 30px -10px rgba(0, 0, 0, 0.15)",
    goldGlow: "0 0 20px -5px rgba(212, 175, 55, 0.3)",
  },
  motion: {
    fast: "duration-150 ease-in-out",
    normal: "duration-200 ease-in-out",
    slow: "duration-300 ease-in-out",
  },
  spacing: {
    pagePadding: "p-4 sm:p-6 lg:p-8",
    sectionGap: "space-y-6 lg:space-y-8",
    gridGap: "gap-4 lg:gap-6",
    touchTarget: "min-h-[44px] min-w-[44px]",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;

