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
  name: 'Petpallets Admin',
  logo: '/logo-symbol.svg',
  version: '0.1.0',
  theme: {
    // Petpallets brand — extracted from the logo. See html/DESIGN.md and
    // design/adminpro-design-docs/design.md for the full token reference.
    primaryColor: '#5CC4A8', // Mint Teal 500
    infoColor: '#5CC4A8',
    successColor: '#2D8C5A',
    warningColor: '#E7AD42', // Warm Gold — "needs attention" only, never decorative
    errorColor: '#D14343',
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
    // Swiss precision: small radii, flat buttons, borders over shadows.
    borderRadius: 4,
    borderRadiusLG: 6,
    controlHeight: 32,
    colorBgLayout: '#F7F6F7',
    colorText: '#272425', // logo pupil dark
    colorTextSecondary: '#7E787A',
    colorTextPlaceholder: '#BEBABB',
    colorBorderSecondary: '#EDEBEC',
    fontFamily:
      "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Layout: { headerHeight: 56 },
    Card: { headerFontSize: 15 },
    Table: { headerBg: '#F7F6F7', headerColor: '#484345', rowHoverBg: '#FAFAF9' },
    Menu: {
      itemSelectedBg: '#F2FBF8',
      itemSelectedColor: '#368F79',
      itemBorderRadius: 4,
      itemMarginInline: 8,
    },
    Button: { primaryShadow: 'none', fontWeight: 500 },
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pet-portal-access-token',
  USER: 'pet-portal-user',
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
 * Chart chrome. `series` is the brand chart hue. The UI primary (#5CC4A8) sits
 * at ~2.1:1 on the white card surface, so charts step up to Mint Teal 700
 * (#368F79, ~3.4:1) to keep the >= 3:1 contrast the chart marks need; fill
 * opacity 0.28 reproduces the brand area-gradient from the design mockups.
 * Every chart here plots a single measure, so all marks share one hue — the
 * axis and tooltip carry the values, and colour never re-encodes what mark
 * length already shows.
 */
export const CHART_TOKENS = {
  series: '#368F79',
  seriesFillOpacity: 0.28,
  grid: '#EDEBEC',
  axisLabel: '#9E999B',
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
