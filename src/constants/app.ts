import type { ThemeConfig } from 'antd';
/**
 * Import the ESM locale modules, not `antd/locale/*`. Those files are CJS
 * (`module.exports = require(...)`), and the interop wrapper Vite hands back puts
 * the locale one level down under `default` — so `locale.locale` reads as
 * undefined, antd silently falls back to its built-in English, and ProComponents
 * maps that undefined straight to its zh-CN intl.
 */
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';

/** Change these values to rebrand the boilerplate. */
export const APP_CONFIG = {
  name: 'AdminPro',
  logo: '/logo-symbol.svg',
  version: '0.1.0',
  theme: {
    // Design system §4.1 / §16.
    primaryColor: '#1677FF',
    infoColor: '#1677FF',
    successColor: '#22C55E',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
  },
} as const;

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: APP_CONFIG.theme.primaryColor,
    colorInfo: APP_CONFIG.theme.infoColor,
    colorSuccess: APP_CONFIG.theme.successColor,
    colorWarning: APP_CONFIG.theme.warningColor,
    colorError: APP_CONFIG.theme.errorColor,
    fontSize: 14,
    borderRadius: 8,
    borderRadiusLG: 12,
    controlHeight: 36,
    colorBgLayout: '#F5F7FB',
    colorText: '#1F2937',
    colorTextSecondary: '#626D7D',
    colorTextPlaceholder: '#707B8B',
    colorBorderSecondary: '#EEF0F3',
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: { Card: { headerFontSize: 16 }, Table: { headerBg: '#F8FAFC' } },
};

export const STORAGE_KEYS = {
  USER: 'antd-admin-boilerplate-user',
  PROFILE: 'antd-admin-boilerplate-profile',
} as const;

const LOCALES = { 'en-US': enUS, 'zh-CN': zhCN, 'ja-JP': jaJP } as const;

/**
 * The locale the language setting maps to. This has to reach both `ConfigProvider`
 * *and* `ProConfigProvider`: ProComponents keeps its own `intl` and only falls back
 * to the antd locale when it is handed one, so a layout that skips this renders
 * antd in English and ProComponents in Chinese.
 */
export const localeFor = (language: string) => LOCALES[language as keyof typeof LOCALES] ?? enUS;

/**
 * Auxiliary accents (design system §4.3). Stat tiles, chart categories and icon
 * tints only — never a primary CTA, which is always `colorPrimary`.
 */
export const ACCENT_COLORS = {
  primary: APP_CONFIG.theme.primaryColor,
  success: APP_CONFIG.theme.successColor,
  warning: APP_CONFIG.theme.warningColor,
  error: APP_CONFIG.theme.errorColor,
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  orange: '#F97316',
} as const;

export type AccentName = keyof typeof ACCENT_COLORS;

/** 8-digit hex: the accent at 12% over any surface, in light or dark mode. */
export const accentTint = (name: AccentName) => `${ACCENT_COLORS[name]}1F`;

/**
 * Chart chrome. `series` is the brand primary, checked against the white card
 * surface for lightness band, chroma, and >= 3:1 contrast. Every chart here plots
 * a single measure, so all marks share one hue — the axis and tooltip carry the
 * values, and colour never re-encodes what mark length already shows.
 */
export const CHART_TOKENS = {
  series: APP_CONFIG.theme.primaryColor,
  seriesFillOpacity: 0.1,
  grid: '#e6eef8',
  axisLabel: '#67727a',
  /**
   * Categorical slots for charts where the colour *is* the identity (traffic
   * sources). Validated as a set — lightness band, chroma floor, adjacent-pair
   * CVD separation and normal-vision separation — in both modes; the dark column
   * is re-stepped for the dark surface, not flipped. Three light slots sit under
   * 3:1 against the card, so every chart that uses them ships its `ChartDataTable`
   * and direct legend labels as the required relief. Assign in order; never cycle.
   */
  categorical: {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'],
  },
} as const;

/**
 * Spread this into a plot: `<Area {...NO_ENTRY_ANIMATION} />`. The entry animation
 * is decorative and G2 ignores `prefers-reduced-motion`, so it would animate for
 * exactly the people who asked it not to.
 *
 * Spread from a variable rather than written as a prop because @ant-design/plots
 * types `AreaOptions` as `Omit<Options, 'yField'>`, and `Omit` over an
 * intersection containing a union drops mark-level keys — the prop is rejected by
 * the types but reaches G2 at runtime.
 */
export const NO_ENTRY_ANIMATION = { animate: false };
