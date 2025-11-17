'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface SystemSettings {
  app_name: string;
  company_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_color: string;
  timezone: string;
  language: string;
  date_format: string;
  footer_text: string;
  show_powered_by: boolean;
}

interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SystemSettings = {
  app_name: 'M&E Data Intelligence System',
  company_name: '',
  logo_url: null,
  favicon_url: null,
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
  accent_color: '#F59E0B',
  sidebar_color: '#1F2937',
  timezone: 'UTC',
  language: 'en',
  date_format: 'YYYY-MM-DD',
  footer_text: '',
  show_powered_by: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getPublicSystemSettings();
      setSettings(response.data);
      
      // Apply theme colors to CSS variables
      if (response.data) {
        applyTheme(response.data);
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
      // Use default settings on error
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (settings: SystemSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.primary_color);
    root.style.setProperty('--color-secondary', settings.secondary_color);
    root.style.setProperty('--color-accent', settings.accent_color);
    root.style.setProperty('--color-sidebar', settings.sidebar_color);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

