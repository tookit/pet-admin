import { ApiOutlined, BellOutlined, SettingOutlined, SlidersOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import GeneralTab, { CancelSaveFooter } from './GeneralTab';
import IntegrationsTab from './IntegrationsTab';
import NotificationsTab from './NotificationsTab';
import PreferencesTab from './PreferencesTab';

const TABS = ['general', 'preferences', 'notifications', 'integrations'] as const;
type TabKey = (typeof TABS)[number];

const isTab = (value: string | null): value is TabKey => TABS.includes(value as TabKey);

/** The General and Preferences tabs stage edits in the settings context; the footer saves them. */
export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const active: TabKey = isTab(requested) ? requested : 'general';

  const items = [
    { key: 'general', label: 'General', icon: <SettingOutlined />, children: <GeneralTab /> },
    {
      key: 'preferences',
      label: 'Preferences',
      icon: <SlidersOutlined />,
      children: <PreferencesTab />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <BellOutlined />,
      children: <NotificationsTab />,
    },
    {
      key: 'integrations',
      label: 'Integrations',
      icon: <ApiOutlined />,
      children: <IntegrationsTab />,
    },
  ];

  return (
    <PageContainer
      title="Settings"
      subTitle="Manage your organization settings, preferences, and integrations."
    >
      <Tabs
        activeKey={active}
        items={items}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
      />
      {(active === 'general' || active === 'preferences') && <CancelSaveFooter />}
    </PageContainer>
  );
}
