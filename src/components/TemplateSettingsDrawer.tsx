import {
  AppstoreOutlined,
  BgColorsOutlined,
  BulbOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons';
import {
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Flex,
  Radio,
  Segmented,
  Space,
  Switch,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { APP_CONFIG } from '@/constants/app';
import { DEFAULT_SETTINGS, useSettings, type LayoutMode } from '@/contexts/SettingsContext';

const { Text, Title } = Typography;

const COLOR_PRESETS = [
  { name: 'Blue', value: '#1677FF' },
  { name: 'Purple', value: '#722ED1' },
  { name: 'Cyan', value: '#08979C' },
  { name: 'Green', value: '#389E0D' },
  { name: 'Orange', value: '#D46B08' },
  { name: 'Magenta', value: '#C41D7F' },
] as const;

const LAYOUTS: Array<{
  value: LayoutMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'side',
    label: 'Sidebar',
    description: 'Classic navigation',
    icon: <MenuFoldOutlined />,
  },
  {
    value: 'mix',
    label: 'Mixed',
    description: 'Header and sidebar',
    icon: <AppstoreOutlined />,
  },
  {
    value: 'top',
    label: 'Top',
    description: 'Horizontal navigation',
    icon: <DesktopOutlined />,
  },
];

interface TemplateSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="template-settings-section-heading">
      <Title level={5}>{title}</Title>
      <Text type="secondary">{description}</Text>
    </div>
  );
}

function ThemeSettings() {
  const { settings, commit } = useSettings();

  return (
    <div className="template-settings-stack">
      <section>
        <SectionHeading title="Mode" description="Choose the appearance for your workspace." />
        <Segmented
          block
          size="large"
          value={settings.mode === 'dark' ? 'dark' : 'light'}
          onChange={(mode) => commit({ mode })}
          options={[
            { value: 'light', label: 'Light', icon: <SunOutlined /> },
            { value: 'dark', label: 'Dark', icon: <MoonOutlined /> },
          ]}
        />
      </section>

      <Divider />

      <section>
        <SectionHeading
          title="Theme color"
          description="Apply a preset or select a custom brand color."
        />
        <Flex wrap gap={12} className="template-color-grid">
          {COLOR_PRESETS.map((color) => (
            <Tooltip title={color.name} key={color.value}>
              <Button
                aria-label={`Use ${color.name} theme`}
                aria-pressed={settings.primaryColor.toUpperCase() === color.value}
                className="template-color-swatch"
                style={{ '--swatch-color': color.value } as React.CSSProperties}
                onClick={() => commit({ primaryColor: color.value })}
              >
                <span className="template-color-dot" />
              </Button>
            </Tooltip>
          ))}
          <ColorPicker
            value={settings.primaryColor}
            onChangeComplete={(color) => commit({ primaryColor: color.toHexString() })}
          >
            <Button className="template-custom-color" icon={<BgColorsOutlined />}>
              Custom
            </Button>
          </ColorPicker>
        </Flex>
      </section>

      <div className="template-settings-note">
        <BulbOutlined />
        <div>
          <Text strong>Live preview</Text>
          <Text type="secondary">Changes apply instantly and are saved in this browser.</Text>
        </div>
      </div>
    </div>
  );
}

function LayoutSettings() {
  const { settings, commit } = useSettings();

  return (
    <div className="template-settings-stack">
      <section>
        <SectionHeading
          title="Admin layout"
          description="Choose how primary navigation is arranged."
        />
        <Radio.Group
          value={settings.layout}
          onChange={(event) => commit({ layout: event.target.value as LayoutMode })}
          className="template-layout-grid"
        >
          {LAYOUTS.map((layout) => (
            <Radio.Button key={layout.value} value={layout.value}>
              <span className="template-layout-icon">{layout.icon}</span>
              <span>
                <strong>{layout.label}</strong>
                <small>{layout.description}</small>
              </span>
            </Radio.Button>
          ))}
        </Radio.Group>
      </section>

      <Divider />

      <section className="template-settings-toggle">
        <div>
          <Title level={5}>Collapse sidebar</Title>
          <Text type="secondary">Keep more room available for page content.</Text>
        </div>
        <Switch
          checked={settings.collapsed}
          disabled={settings.layout === 'top'}
          onChange={(collapsed) => commit({ collapsed })}
        />
      </section>
    </div>
  );
}

export default function TemplateSettingsDrawer({ open, onClose }: TemplateSettingsDrawerProps) {
  const { commit } = useSettings();

  const reset = () =>
    commit({
      mode: DEFAULT_SETTINGS.mode,
      primaryColor: String(APP_CONFIG.theme.primaryColor),
      layout: DEFAULT_SETTINGS.layout,
      collapsed: DEFAULT_SETTINGS.collapsed,
    });

  return (
    <Drawer
      className="template-settings-drawer"
      width={400}
      open={open}
      onClose={onClose}
      title={
        <Space>
          <span className="template-settings-title-icon">
            <SettingOutlined />
          </span>
          Template settings
        </Space>
      }
      extra={
        <Tooltip title="Reset appearance">
          <Button icon={<ReloadOutlined />} onClick={reset} aria-label="Reset appearance" />
        </Tooltip>
      }
    >
      <Tabs
        centered
        defaultActiveKey="theme"
        items={[
          {
            key: 'theme',
            label: (
              <Space>
                <BgColorsOutlined /> Theme
              </Space>
            ),
            children: <ThemeSettings />,
          },
          {
            key: 'layout',
            label: (
              <Space>
                <AppstoreOutlined /> Layout
              </Space>
            ),
            children: <LayoutSettings />,
          },
        ]}
      />
    </Drawer>
  );
}
