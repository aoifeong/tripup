// Light Mode Colours
export const lightColors = {
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  primary: '#3b82f6',
  secondary: '#3b82f6',
};

// Dark Mode Colours
export const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  muted: '#94a3b8',
  border: '#334155',
  primary: '#60a5fa',
  secondary: '#60a5fa',
};

export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? darkColors : lightColors;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
};

export const radius = {
  md: 8,
};

// For backward compatibility- default to light mode
export const colors = lightColors;
