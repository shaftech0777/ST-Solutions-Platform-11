export const TOKENS = {
  colors: {
    // Primary Gold Accent Suite
    gold: {
      light: "#E5C158",
      DEFAULT: "#D4AF37",
      dark: "#C59B27",
      hover: "#B88E20",
      subtle: "rgba(212, 175, 55, 0.12)",
      border: "rgba(212, 175, 55, 0.3)",
      glow: "rgba(212, 175, 55, 0.25)",
    },
    // Dark Theme Palette
    dark: {
      bg: "#090A0F",
      surface: "#12131A",
      surfaceElevated: "#181924",
      border: "#252836",
      borderSubtle: "#1F212E",
      textPrimary: "#F8F9FA",
      textSecondary: "#9E9EAD",
      textMuted: "#6B6E7D",
    },
    // Light Theme Palette
    light: {
      bg: "#F8F9FB",
      surface: "#FFFFFF",
      surfaceElevated: "#F3F4F7",
      border: "#E2E5EC",
      borderSubtle: "#EDF0F5",
      textPrimary: "#0D0E12",
      textSecondary: "#4A4D5A",
      textMuted: "#7E8291",
    },
    // Semantic States
    status: {
      success: {
        bg: "rgba(16, 185, 129, 0.1)",
        text: "#10B981",
        border: "rgba(16, 185, 129, 0.25)",
      },
      warning: {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "#F59E0B",
        border: "rgba(245, 158, 11, 0.25)",
      },
      danger: {
        bg: "rgba(239, 68, 68, 0.1)",
        text: "#EF4444",
        border: "rgba(239, 68, 68, 0.25)",
      },
      info: {
        bg: "rgba(59, 130, 246, 0.1)",
        text: "#3B82F6",
        border: "rgba(59, 130, 246, 0.25)",
      },
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    sizes: {
      display: "text-3xl lg:text-4xl font-bold tracking-tight",
      h1: "text-2xl lg:text-3xl font-bold tracking-tight",
      h2: "text-xl lg:text-2xl font-semibold tracking-tight",
      h3: "text-lg font-semibold tracking-tight",
      h4: "text-base font-semibold",
      body: "text-sm font-normal leading-relaxed",
      bodySmall: "text-xs font-normal leading-normal",
      caption: "text-[11px] font-medium leading-tight",
      label: "text-xs font-medium tracking-wide uppercase",
      metric: "text-2xl lg:text-3xl font-bold tracking-tight font-mono",
    },
  },
  radius: {
    sm: "rounded-md",
    DEFAULT: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  },
  shadows: {
    subtle: "0 2px 8px -2px rgba(0, 0, 0, 0.08)",
    elevated: "0 10px 30px -10px rgba(0, 0, 0, 0.25)",
    goldGlow: "0 0 20px -5px rgba(212, 175, 55, 0.3)",
  },
  spacing: {
    pagePadding: "p-4 sm:p-6 lg:p-8",
    sectionGap: "space-y-6 lg:space-y-8",
    gridGap: "gap-4 lg:gap-6",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;
