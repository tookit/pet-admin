import { ProCard } from '@ant-design/pro-components';
import { App, Radio, Switch } from 'antd';
import { useSettings, type Settings } from '@/contexts/SettingsContext';

const SWITCHES: Array<{ key: keyof Settings; title: string; description: string }> = [
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Account activity, invites and weekly summaries by email.',
  },
  {
    key: 'pushNotifications',
    title: 'Push Notifications',
    description: 'Browser push for anything that needs an answer today.',
  },
  {
    key: 'systemNotifications',
    title: 'System Notifications',
    description: 'In-app toasts for background jobs and imports.',
  },
];

/** Per-topic switches save on change; there is nothing to stage here. */
export default function NotificationsTab() {
  const { settings, save } = useSettings();
  const { message } = App.useApp();

  const apply = (patch: Partial<Settings>) => {
    save({ ...settings, ...patch });
    void message.success('Notification preference updated');
  };

  return (
    <ProCard
      headerBordered
      title="Notifications"
      subTitle="Choose what reaches you, and how often. Saved as you toggle."
    >
      {SWITCHES.map((item) => (
        <div className="setting-row" key={item.key}>
          <span>
            {item.title}
            <small>{item.description}</small>
          </span>
          <Switch
            checked={Boolean(settings[item.key])}
            onChange={(checked) => apply({ [item.key]: checked })}
          />
        </div>
      ))}
      <div className="setting-row">
        <span>
          Digest Frequency
          <small>How often the summary email is sent.</small>
        </span>
        <Radio.Group
          value={settings.digest}
          onChange={(event) => apply({ digest: event.target.value as string })}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'never', label: 'Never' },
          ]}
        />
      </div>
    </ProCard>
  );
}
