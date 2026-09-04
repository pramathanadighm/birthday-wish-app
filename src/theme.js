// Theme definitions and dynamic styling engine
export const THEMES = {
  golden: {
    id: 'golden',
    name: 'Golden',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#b45309',
    glow: 'rgba(245, 158, 11, 0.45)',
    border: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    bgTint: 'rgba(245, 158, 11, 0.04)',
    swatch: '#f59e0b'
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#6d28d9',
    glow: 'rgba(139, 92, 246, 0.45)',
    border: 'rgba(139, 92, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6366f1 100%)',
    bgTint: 'rgba(139, 92, 246, 0.05)',
    swatch: '#8b5cf6'
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    accent: '#ec4899',
    accentLight: '#f472b6',
    accentDark: '#be185d',
    glow: 'rgba(236, 72, 153, 0.45)',
    border: 'rgba(236, 72, 153, 0.3)',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #f43f5e 100%)',
    bgTint: 'rgba(236, 72, 153, 0.05)',
    swatch: '#ec4899'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    accent: '#06b6d4',
    accentLight: '#38bdf8',
    accentDark: '#0284c7',
    glow: 'rgba(6, 182, 212, 0.45)',
    border: 'rgba(6, 182, 212, 0.3)',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 50%, #0ea5e9 100%)',
    bgTint: 'rgba(6, 182, 212, 0.05)',
    swatch: '#06b6d4'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    accent: '#10b981',
    accentLight: '#34d399',
    accentDark: '#059669',
    glow: 'rgba(16, 185, 129, 0.45)',
    border: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    bgTint: 'rgba(16, 185, 129, 0.05)',
    swatch: '#10b981'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    accent: '#f97316',
    accentLight: '#fb923c',
    accentDark: '#c2410c',
    glow: 'rgba(249, 115, 22, 0.45)',
    border: 'rgba(249, 115, 22, 0.3)',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    bgTint: 'rgba(249, 115, 22, 0.05)',
    swatch: '#f97316'
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    accent: '#a855f7',
    accentLight: '#c084fc',
    accentDark: '#7e22ce',
    glow: 'rgba(168, 85, 247, 0.45)',
    border: 'rgba(168, 85, 247, 0.3)',
    gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #d946ef 100%)',
    bgTint: 'rgba(168, 85, 247, 0.05)',
    swatch: '#a855f7'
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry',
    accent: '#e11d48',
    accentLight: '#fb7185',
    accentDark: '#9f1239',
    glow: 'rgba(225, 29, 72, 0.45)',
    border: 'rgba(225, 29, 72, 0.3)',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #be123c 100%)',
    bgTint: 'rgba(225, 29, 72, 0.05)',
    swatch: '#e11d48'
  }
};

/**
 * Applies the given theme by setting CSS custom properties on root
 * @param {string} themeKey 
 */
export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.golden;
  const root = document.documentElement;

  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-accent-light', theme.accentLight);
  root.style.setProperty('--theme-accent-dark', theme.accentDark);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-border', theme.border);
  root.style.setProperty('--theme-gradient', theme.gradient);
  root.style.setProperty('--theme-bg-tint', theme.bgTint);

  document.body.setAttribute('data-theme', theme.id);
  return theme;
}

/**
 * Helper to get current theme object
 */
export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES.golden;
}
