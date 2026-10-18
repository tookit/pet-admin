import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { APP_CONFIG } from '@/constants/app';
import { readPreferences, savePreferences } from '@/utils/storage';

export type LayoutMode = 'side' | 'mix' | 'top';

export const DEFAULT_SETTINGS = {
  name: String(APP_CONFIG.name),
  logo: String(APP_CONFIG.logo),
  email: 'admin@example.com',
  website: '',
  description: 'Building better products, together.',
  primaryColor: String(APP_CONFIG.theme.primaryColor),
  mode: 'light',
  layout: 'mix' as LayoutMode,
  collapsed: false,
  language: 'en-US',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24',
  pageSize: 10,
  density: 'middle',
  landingPage: '/dashboard',
  compact: false,
  emailNotifications: true,
  pushNotifications: false,
  systemNotifications: true,
  digest: 'weekly',
  // Account security. Real enforcement needs a backend; these only record intent.
  twoFactor: false,
  loginNotifications: true,
  securityNewLogin: true,
  securityAccountChanges: true,
  securitySuspicious: true,
  securityTwoFactorAlerts: false,
  securityWeeklyReport: true,
};
export type Settings = typeof DEFAULT_SETTINGS;
const KEY = 'adminpro-settings';
const SettingsContext = createContext<{
  settings: Settings;
  saved: Settings;
  preview: (value: Partial<Settings>) => void;
  commit: (value: Partial<Settings>) => void;
  save: (value: Settings) => void;
  cancel: () => void;
} | null>(null);
export function SettingsProvider({ children }: PropsWithChildren) {
  const [saved, setSaved] = useState(() => readPreferences(KEY, DEFAULT_SETTINGS));
  const [settings, setSettings] = useState(saved);
  useEffect(() => {
    document.title = settings.name;
  }, [settings.name]);
  return (
    <SettingsContext.Provider
      value={{
        settings,
        saved,
        preview: (value) => setSettings((previous) => ({ ...previous, ...value })),
        commit: (value) => {
          setSettings((previous) => ({ ...previous, ...value }));
          setSaved((previous) => {
            const next = { ...previous, ...value };
            savePreferences(KEY, next);
            return next;
          });
        },
        save: (value) => {
          savePreferences(KEY, value);
          setSaved(value);
          setSettings(value);
        },
        cancel: () => setSettings(saved),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings requires SettingsProvider');
  return context;
}

/** Resolves `mode` against the OS preference. Charts need it to pick their palette. */
export function useDarkMode() {
  const { settings } = useSettings();
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return settings.mode === 'dark' || (settings.mode === 'system' && systemDark);
}
