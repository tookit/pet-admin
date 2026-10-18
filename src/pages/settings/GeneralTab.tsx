import {
  BarcodeOutlined,
  BgColorsOutlined,
  DeleteOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import {
  App,
  Button,
  ColorPicker,
  Input,
  Modal,
  Progress,
  Radio,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSettings, type Settings } from '@/contexts/SettingsContext';
import { ACCENT_COLORS } from '@/constants/app';

const LANGUAGES = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja-JP', label: '日本語' },
];

const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '(UTC+08:00) Beijing, Shanghai, Singapore' },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
  { value: 'Europe/London', label: '(UTC+00:00) London, Dublin, Lisbon' },
  { value: 'America/New_York', label: '(UTC-05:00) New York, Toronto' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Los Angeles, Vancouver' },
];

const DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-01-01)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (01/01/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/01/2026)' },
];

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const PRESET_COLORS = [
  ACCENT_COLORS.primary,
  ACCENT_COLORS.purple,
  ACCENT_COLORS.success,
  ACCENT_COLORS.warning,
  ACCENT_COLORS.error,
  ACCENT_COLORS.cyan,
];

/** Card headers carry an icon, a title and the one-line description the docs ask for. */
const head = (icon: ReactNode, title: string, description: string, extra?: ReactNode) => ({
  title: (
    <span className="card-head">
      <span className="setting-icon">{icon}</span>
      <span>
        {title}
        <small>{description}</small>
      </span>
    </span>
  ),
  extra,
});

const isDirty = (settings: Settings, saved: Settings) =>
  JSON.stringify(settings) !== JSON.stringify(saved);

export function CancelSaveFooter() {
  const { settings, saved, save, cancel } = useSettings();
  const { message } = App.useApp();
  const dirty = isDirty(settings, saved);
  return (
    <div className="save-footer">
      <Button onClick={cancel} disabled={!dirty}>
        Cancel
      </Button>
      <Button
        type="primary"
        disabled={!dirty}
        onClick={() => {
          save(settings);
          void message.success('Settings saved');
        }}
      >
        Save Changes
      </Button>
    </div>
  );
}

/** Organization identity, region, appearance, billing, security entry and danger zone. */
export default function GeneralTab() {
  const { settings, saved, preview } = useSettings();
  const { message, modal } = App.useApp();
  const [form] = ProForm.useForm<Settings>();
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoDraft, setLogoDraft] = useState(saved.logo);

  const confirmDelete = () => {
    let typed = '';
    modal.confirm({
      title: 'Delete this account?',
      okText: 'Delete account',
      okButtonProps: { danger: true },
      content: (
        <div>
          <p>This cannot be undone. Type DELETE to confirm.</p>
          <Input placeholder="DELETE" onChange={(event) => (typed = event.target.value)} />
        </div>
      ),
      onOk: () =>
        typed === 'DELETE'
          ? Promise.reject(
              new Error(
                'Deleting an account needs a backend. This demo keeps everything in the browser.',
              ),
            )
          : Promise.reject(new Error('Type DELETE to confirm.')),
    });
  };

  return (
    <ProForm<Settings>
      form={form}
      initialValues={saved}
      submitter={false}
      onValuesChange={(_, values) => preview(values)}
    >
      <div className="settings-grid">
        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          {...head(
            <BarcodeOutlined />,
            'Organization Information',
            'Basic information about your organization.',
            <Button onClick={() => setLogoOpen(true)}>Change Logo</Button>,
          )}
        >
          <ProFormText
            name="name"
            label="Organization Name"
            rules={[{ required: true, whitespace: true }]}
          />
          <ProFormText
            name="email"
            label="Organization Email"
            rules={[{ required: true, type: 'email' }]}
          />
          <ProFormText name="website" label="Website" rules={[{ type: 'url' }]} />
          <ProFormTextArea
            name="description"
            label="Description"
            fieldProps={{ maxLength: 200, showCount: true, rows: 4 }}
          />
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          {...head(
            <GlobalOutlined />,
            'Language & Region',
            'Set your language, timezone, and regional preferences.',
          )}
        >
          <div className="setting-row">
            <span>Language</span>
            <Select
              style={{ width: 280, maxWidth: '100%' }}
              value={settings.language}
              onChange={(language) => preview({ language })}
              options={LANGUAGES}
              aria-label="Language"
            />
          </div>
          <div className="setting-row">
            <span>Timezone</span>
            <Select
              style={{ width: 280, maxWidth: '100%' }}
              showSearch
              value={settings.timezone}
              onChange={(timezone) => preview({ timezone })}
              options={TIMEZONES}
              aria-label="Timezone"
            />
          </div>
          <div className="setting-row">
            <span>Date Format</span>
            <Select
              style={{ width: 280, maxWidth: '100%' }}
              value={settings.dateFormat}
              onChange={(dateFormat) => preview({ dateFormat })}
              options={DATE_FORMATS}
              aria-label="Date format"
            />
          </div>
          <div className="setting-row">
            <span>Time Format</span>
            <Radio.Group
              value={settings.timeFormat}
              onChange={(event) => preview({ timeFormat: event.target.value as string })}
              options={[
                { value: '12', label: '12-hour (1:00 PM)' },
                { value: '24', label: '24-hour (13:00)' },
              ]}
            />
          </div>
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          {...head(<BgColorsOutlined />, 'Appearance', 'Customize how the admin looks and feels.')}
        >
          <div className="setting-row">
            <span>Theme</span>
            <Radio.Group
              value={settings.mode}
              onChange={(event) => preview({ mode: event.target.value as string })}
              options={THEMES}
            />
          </div>
          <div className="setting-row">
            <span>Primary Color</span>
            <ColorPicker
              value={settings.primaryColor}
              presets={[{ label: 'AdminPro', colors: PRESET_COLORS }]}
              onChangeComplete={(color) => preview({ primaryColor: color.toHexString() })}
            />
          </div>
          <div className="setting-row">
            <span>Sidebar Style</span>
            <Radio.Group
              value={settings.collapsed ? 'collapsed' : 'expanded'}
              onChange={(event) => preview({ collapsed: event.target.value === 'collapsed' })}
              options={[
                { value: 'expanded', label: 'Expanded' },
                { value: 'collapsed', label: 'Collapsed' },
              ]}
            />
          </div>
          <Typography.Text type="secondary">
            Changes preview live. Save keeps them, Cancel rolls back.
          </Typography.Text>
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          {...head(
            <span aria-hidden>💳</span>,
            'Plan & Billing',
            'Manage your subscription and billing information.',
          )}
        >
          <div className="plan-summary">
            <span>
              <strong>Pro Plan</strong>
              <small>Everything you need to manage your business.</small>
            </span>
            <span className="plan-price">
              <strong>$49</strong> / month <Tag color="success">Active</Tag>
            </span>
          </div>
          <div className="setting-row">
            <span>Users</span>
            <Progress percent={36} showInfo={false} style={{ width: 200 }} />
            <Typography.Text type="secondary">18 / 50</Typography.Text>
          </div>
          <div className="setting-row">
            <span>Storage</span>
            <Progress percent={12} showInfo={false} style={{ width: 200 }} />
            <Typography.Text type="secondary">12.4 GB / 100 GB</Typography.Text>
          </div>
          <Button onClick={() => void message.info('Billing is not connected in this demo.')}>
            Manage Billing
          </Button>
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          {...head(
            <SafetyCertificateOutlined />,
            'Account Security',
            'Manage your account security settings.',
          )}
        >
          <div className="setting-row">
            <span>
              Two-Factor Authentication
              <small>Add an extra layer of security to your account.</small>
            </span>
            <Switch
              checked={settings.twoFactor}
              onChange={(twoFactor) => {
                preview({ twoFactor });
                if (twoFactor) {
                  void message.info('Enforcing two-factor authentication needs a backend.');
                }
              }}
            />
          </div>
          <div className="setting-row">
            <span>
              Login Notifications
              <small>Get notified when someone logs into your account.</small>
            </span>
            <Switch
              checked={settings.loginNotifications}
              onChange={(loginNotifications) => preview({ loginNotifications })}
            />
          </div>
          <div className="setting-row">
            <span>
              Active Sessions
              <small>Manage your active sessions across devices.</small>
            </span>
            <Link to="/security">
              <Button>View Sessions</Button>
            </Link>
          </div>
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 12 }}
          headerBordered
          className="danger-card"
          {...head(
            <DeleteOutlined />,
            'Danger Zone',
            'Permanently delete your account and all of your data.',
          )}
        >
          <div className="setting-row">
            <span>
              Delete Account
              <small>
                Once deleted there is no going back. Needs a backend, so it is not wired up here.
              </small>
            </span>
            <Button danger onClick={confirmDelete}>
              Delete Account
            </Button>
          </div>
        </ProCard>
      </div>

      <Modal
        title="Organization logo"
        open={logoOpen}
        okText="Use logo"
        onCancel={() => setLogoOpen(false)}
        onOk={() => {
          preview({ logo: logoDraft });
          setLogoOpen(false);
        }}
      >
        <p className="card-description">
          Uploads need file storage. Paste a URL or a path under <code>public/</code> instead — it
          previews immediately and is kept with the rest of your settings.
        </p>
        <Input
          value={logoDraft}
          onChange={(event) => setLogoDraft(event.target.value)}
          placeholder="/logo-symbol.svg"
          aria-label="Logo URL"
        />
      </Modal>
    </ProForm>
  );
}
