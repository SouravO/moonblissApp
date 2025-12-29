/**
 * Global Theme Configuration
 * Red & Blue dynamic themes
 */

const THEME_MODES = {
  NORMAL: "normal",       // BLUE
  MENSTRUAL: "menstrual", // RED
};

// Base theme colors shared by both modes
const BASE_THEME = {
  border: "border-slate-200",
  shadow: "shadow-sm",
  backdropBlur: "backdrop-blur",
  borderRadius: {
    card: "rounded-3xl",
    button: "rounded-2xl",
    small: "rounded-xl",
  },
};

const THEME_CONFIG = {
  /* =====================
     NORMAL MODE (BLUE)
     ===================== */
  [THEME_MODES.NORMAL]: {
    mode: THEME_MODES.NORMAL,

    background: "bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50",

    blobs: {
      blob1: "bg-blue-400/40",
      blob2: "bg-sky-300/30",
    },

    header: {
      text: "text-slate-900",
      userName: "text-blue-700",
    },

    card: {
      default: "border-blue-200 bg-white/80",
      bordered: "border-blue-100 bg-gradient-to-br from-white to-blue-50",
    },

    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      tertiary: "text-slate-500",
    },

    gradients: {
      primary: "from-blue-600 to-sky-400",
      dark: "from-blue-700 to-sky-500",
    },

    icons: {
      default: "bg-blue-600/10 text-blue-700",
      light: "bg-white/80 border-blue-200",
    },

    progressBar: "from-blue-600 to-sky-400",

    button: {
      primary: "bg-blue-600 hover:bg-blue-700",
      secondary: "bg-blue-100 hover:bg-blue-200",
      text: "text-blue-900 hover:text-blue-800",
    },

    heroCard: "border-blue-200 bg-white/80",
  },

  /* =====================
     MENSTRUAL MODE (RED)
     ===================== */
  [THEME_MODES.MENSTRUAL]: {
    mode: THEME_MODES.MENSTRUAL,

    background: "bg-gradient-to-b from-red-50 via-rose-100 to-red-50",

    blobs: {
      blob1: "bg-red-400/40",
      blob2: "bg-rose-300/30",
    },

    header: {
      text: "text-slate-900",
      userName: "text-red-700",
    },

    card: {
      default: "border-red-200 bg-white/80",
      bordered: "border-red-100 bg-gradient-to-br from-white to-rose-50",
    },

    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      tertiary: "text-slate-500",
    },

    gradients: {
      primary: "from-red-600 to-rose-400",
      dark: "from-red-700 to-rose-500",
    },

    icons: {
      default: "bg-red-600/10 text-red-700",
      light: "bg-white/80 border-red-200",
    },

    progressBar: "from-red-600 to-rose-400",

    button: {
      primary: "bg-red-600 hover:bg-red-700",
      secondary: "bg-red-100 hover:bg-red-200",
      text: "text-red-900 hover:text-red-800",
    },

    heroCard:
      "border-red-200 bg-gradient-to-br from-red-600 to-rose-500 text-white",
  },
};

/* =====================
   THEME HELPERS
   ===================== */

export const getThemeConfig = (isPeriodActive = false) => {
  const mode = isPeriodActive ? THEME_MODES.MENSTRUAL : THEME_MODES.NORMAL;
  return {
    ...BASE_THEME,
    ...THEME_CONFIG[mode],
  };
};

export const getThemeColor = (
  isPeriodActive = false,
  colorKey = "gradients.primary"
) => {
  const theme = getThemeConfig(isPeriodActive);
  return colorKey.split(".").reduce((acc, key) => acc?.[key], theme) || "";
};

export default {
  THEME_MODES,
  getThemeConfig,
  getThemeColor,
};
