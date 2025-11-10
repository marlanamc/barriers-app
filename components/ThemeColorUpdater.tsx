'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';

export function ThemeColorUpdater() {
  const { theme } = useTheme();

  useEffect(() => {
    // Update the theme-color meta tag based on current theme
    // Light mode: soft purple from gradient start (#f5f3ff)
    // Dark mode: dark purple from gradient start (#1e1b3d)
    const themeColor = theme === 'dark' ? '#1e1b3d' : '#f5f3ff';
    
    // Find or create the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', themeColor);

    // Also update apple-mobile-web-app-status-bar-style for iOS
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBar);
    }
    
    // Use 'black-translucent' for dark mode (shows white text) or 'default' for light mode
    appleStatusBar.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');
  }, [theme]);

  return null;
}

