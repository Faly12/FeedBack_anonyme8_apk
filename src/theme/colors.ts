export const themes = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceMuted: '#f3f4f6',
    primary: '#0f766e',
    primarySoft: '#ccfbf1',
    text: '#111827',
    textMuted: '#4b5563',
    textSubtle: '#6b7280',
    border: '#e5e7eb',
    borderStrong: '#d1d5db',
    danger: '#be123c',
    dangerSoft: '#fff1f2',
    dangerBorder: '#fecdd3',
    dangerText: '#991b1b',
    inputPlaceholder: '#808080',
    tabInactive: '#6b7280',
    statusBar: 'dark' as const,
  },
  dark: {
    background: '#0f172a',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    primary: '#2dd4bf',
    dark: '#0f172a',
    primarySoft: '#134e4a',
    text: '#f8fafc',
    textMuted: '#cbd5e1',
    textSubtle: '#94a3b8',
    border: '#334155',
    borderStrong: '#475569',
    danger: '#fb7185',
    dangerSoft: '#4c1d24',
    dangerBorder: '#881337',
    dangerText: '#fecdd3',
    inputPlaceholder: '#94a3b8',
    tabInactive: '#94a3b8',
    statusBar: 'light' as const,
  },
};

export type ThemeMode = keyof typeof themes;
export type AppTheme = (typeof themes)[ThemeMode];

export const Colors = themes.light;
