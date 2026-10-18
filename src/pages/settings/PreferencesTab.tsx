import { ProCard, ProForm, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Radio } from 'antd';
import { useSettings, type Settings } from '@/contexts/SettingsContext';

const PAGE_SIZES = [10, 20, 50, 100].map((value) => ({ value, label: `${value} per page` }));
const LANDING_PAGES = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/users', label: 'User Management' },
  { value: '/settings', label: 'Settings' },
];

/** Defaults the shell and the tables read back: page size, density, landing page. */
export default function PreferencesTab() {
  const { saved, preview } = useSettings();
  return (
    <ProForm<Settings>
      initialValues={saved}
      submitter={false}
      onValuesChange={(_, values) => preview(values)}
    >
      <ProCard
        headerBordered
        title="Table & Navigation"
        subTitle="Defaults applied to every list and to the first page after sign-in."
      >
        <ProFormSelect name="pageSize" label="Default Page Size" options={PAGE_SIZES} />
        <ProFormSelect
          name="landingPage"
          label="Default Landing Page"
          options={LANDING_PAGES}
          tooltip="Where the shell sends you after signing in."
        />
        <ProForm.Item name="density" label="Table Density">
          <Radio.Group
            options={[
              { value: 'small', label: 'Compact' },
              { value: 'middle', label: 'Default' },
              { value: 'large', label: 'Comfortable' },
            ]}
          />
        </ProForm.Item>
        <ProFormSwitch
          name="compact"
          label="Compact Mode"
          tooltip="Tightens spacing across the whole interface."
        />
      </ProCard>
    </ProForm>
  );
}
