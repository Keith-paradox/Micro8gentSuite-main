import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeAppearance = 'light' | 'dark';
type ThemeRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultRadius?: ThemeRadius;
}

interface ThemeContextType {
  theme: {
    primary: string;
    mode: ThemeMode;
    appearance: ThemeAppearance;
    radius: ThemeRadius;
  };
  setTheme: (theme: Partial<ThemeContextType['theme']>) => void;
}

const initialTheme: ThemeContextType['theme'] = {
  primary: '#3b82f6', // Default primary color (blue-500)
  mode: 'system',
  appearance: 'light',
  radius: 'md',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultRadius = 'md',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeContextType['theme']>({
    ...initialTheme,
    mode: defaultTheme,
    radius: defaultRadius,
  });

  // Update the theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply appearance class
    root.classList.remove('light', 'dark');
    root.classList.add(theme.appearance);
    
    // Set CSS variables for the primary color
    root.style.setProperty('--primary', theme.primary);
    
    // Set border radius variables
    const radiusValues = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px',
    };
    
    root.style.setProperty('--radius', radiusValues[theme.radius]);
    
  }, [theme]);

  // Detect system preference change
  useEffect(() => {
    if (theme.mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setThemeState(prev => ({
        ...prev,
        appearance: mediaQuery.matches ? 'dark' : 'light'
      }));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    handleChange(); // Initialize
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  const setTheme = (newTheme: Partial<ThemeContextType['theme']>) => {
    setThemeState(prev => {
      const updatedTheme = { ...prev, ...newTheme };
      
      // Handle appearance when mode changes
      if (newTheme.mode) {
        if (newTheme.mode === 'system') {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          updatedTheme.appearance = systemDark ? 'dark' : 'light';
        } else {
          updatedTheme.appearance = newTheme.mode;
        }
      }
      
      return updatedTheme;
    });
  };

  const value = { theme, setTheme };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}