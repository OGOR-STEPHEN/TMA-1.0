export const themes = {
  dark: {
    name: "dark",
    // Primary colors
    primary: "#A75885",
    primaryDark: "#8F3A76",
    
    // Text colors
    text: "#E6EEF3",
    textSecondary: "#B6C2CF",
    textMuted: "#A0AEC0",
    
    // Background colors
    background: "linear-gradient(180deg, rgba(15,23,42,0.72), rgba(8,12,20,0.72))",
    cardBackground: "rgba(0,0,0,0.35)",
    inputBackground: "rgba(255,255,255,0.02)",
    buttonBackground: "rgba(255,255,255,0.04)",
    
    // Border colors
    border: "rgba(255,255,255,0.05)",
    borderLight: "rgba(255,255,255,0.03)",
    
    // Other
    backdropFilter: "blur(10px)",
    shadow: "0 18px 40px rgba(0,0,0,0.55)",
    primaryShadow: "0 10px 28px rgba(167,88,133,0.28)",
  },
  light: {
    name: "light",
    // Primary colors
    primary: "#A75885",
    primaryDark: "#8F3A76",
    
    // Text colors
    text: "#1F2937",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    
    // Background colors
    background: "linear-gradient(180deg, rgba(249,250,251,0.95), rgba(243,244,246,0.95))",
    cardBackground: "rgba(255,255,255,0.9)",
    inputBackground: "rgba(0,0,0,0.03)",
    buttonBackground: "rgba(0,0,0,0.05)",
    
    // Border colors
    border: "rgba(0,0,0,0.1)",
    borderLight: "rgba(0,0,0,0.05)",
    
    // Other
    backdropFilter: "blur(10px)",
    shadow: "0 18px 40px rgba(0,0,0,0.08)",
    primaryShadow: "0 10px 28px rgba(167,88,133,0.28)",
  },
};

export const getTheme = (themeName) => themes[themeName] || themes.dark;
