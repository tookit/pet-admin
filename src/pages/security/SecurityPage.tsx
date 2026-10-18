import { DeleteOutlined, DesktopOutlined, MobileOutlined, MoreOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Badge,
  Button,
  Dropdown,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Progress,
  QRCode,
  Space,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { getSecurity } from '@/api/modules/security.api';
import { useSettings, type Settings } from '@/contexts/SettingsContext';
import type { LoginRecord, SecuritySnapshot } from '@/types';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  {
    label: 'Upper and lower case',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const NOTIFICATION_ROWS: Array<{ key: keyof Settings; title: string; description: string }> = [
  {
    key: 'securityNewLogin',
    title: 'New login attempts',
    description: 'Get notified of new login attempts',
  },
  {
    key: 'securityAccountChanges',
    title: 'Account changes',
    description: 'Password, email or profile changes',
  },
  {
    key: 'securitySuspicious',
    title: 'Suspicious activity',
    description: 'Logins from new locations or devices',
  },
  {
    key: 'securityTwoFactorAlerts',
    title: 'Two-factor authentication',
    description: 'Changes to your second factor',
  },
  {
    key: 'securityWeeklyReport',
    title: 'Weekly security report',
    description: 'A short summary every Monday',
  },
];

/** The score reflects the switches on this page rather than a hidden formula. */
const scoreFor = (settings: Settings) =>
  40 +
  (settings.twoFactor ? 30 : 0) +
  (settings.securityNewLogin ? 10 : 0) +
  (settings.securitySuspicious ? 10 : 0) +
  (settings.securityWeeklyReport ? 10 : 0);

export default function SecurityPage() {
  const { message, modal } = App.useApp();
  const { settings, save } = useSettings();
  const [snapshot, setSnapshot] = useState<SecuritySnapshot>();
  const [password, setPassword] = useState('');
  const [codesOpen, setCodesOpen] = useState(false);
  const [form] = Form.useForm<{ current: string; next: string; confirm: string }>();

  useEffect(() => {
    let active = true;
    getSecurity()
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch(() => void message.error('Unable to load your security settings'));
    return () => {
      active = false;
    };
  }, [message]);

  const score = scoreFor(settings);
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;

  const apply = (patch: Partial<Settings>, notice: string) => {
    save({ ...settings, ...patch });
    void message.success(notice);
  };

  const loginColumns: ColumnsType<LoginRecord> = [
    { title: 'Device', dataIndex: 'device' },
    { title: 'Location', dataIndex: 'location' },
    { title: 'IP Address', dataIndex: 'ip' },
    { title: 'Date & Time', dataIndex: 'at' },
    {
      title: 'Status',
      dataIndex: 'success',
      render: (success: boolean) =>
        success ? <Tag color="success">Success</Tag> : <Tag color="error">Failed</Tag>,
    },
  ];

  const deviceList = (items: SecuritySnapshot['devices']) => (
    <List
      dataSource={items}
      renderItem={(device) => (
        <List.Item
          actions={[
            <Dropdown
              key="actions"
              trigger={['click']}
              menu={{
                items: [
                  { key: 'details', label: 'View details' },
                  { key: 'rename', label: 'Rename device' },
                ].map((item) => ({
                  ...item,
                  onClick: () => void message.info(`${item.label} needs a devices backend.`),
                })),
              }}
            >
              <Button
                size="small"
                icon={<MoreOutlined />}
                aria-label={`Actions for ${device.name}`}
              />
            </Dropdown>,
          ]}
        >
          <List.Item.Meta
            avatar={device.detail.startsWith('iOS') ? <MobileOutlined /> : <DesktopOutlined />}
            title={
              <Space>
                {device.name}
                {device.current && <Tag color="blue">Current device</Tag>}
              </Space>
            }
            description={`${device.detail} · ${device.location}`}
          />
          {device.current ? (
            <Badge status="success" text="Active now" />
          ) : (
            <Space>
              <Typography.Text type="secondary">{device.lastActive}</Typography.Text>
              <Popconfirm
                title={`Remove ${device.name}?`}
                description="The device will need to sign in again."
                okText="Remove"
                onConfirm={() => {
                  void message.info('Removing a device needs a backend.');
                }}
              >
                <Button size="small" danger>
                  Remove
                </Button>
              </Popconfirm>
            </Space>
          )}
        </List.Item>
      )}
    />
  );

  return (
    <PageContainer
      title="Security"
      subTitle="Manage your password, devices and account protection."
    >
      {snapshot?.logins.some((login) => !login.success) && (
        <Alert
          type="warning"
          showIcon
          message="We noticed a failed login from a new location."
          description="If that was not you, change your password and sign out the other sessions."
          action={
            <Button size="small" onClick={() => setCodesOpen(true)}>
              Review activity
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <ProCard className="security-summary">
        <Space size={24} align="center" wrap>
          <Progress type="circle" percent={score} size={96} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Account Protection
            </Typography.Title>
            <Typography.Text type="secondary">
              {score >= 80
                ? 'Your account is well protected.'
                : 'Turn on two-factor authentication to protect your account further.'}
            </Typography.Text>
          </div>
        </Space>
      </ProCard>

      <div className="settings-grid section-card">
        <ProCard title="Change Password" headerBordered>
          <ProForm
            form={form}
            submitter={false}
            onFinish={() =>
              void message.info('Changing a password needs a backend, not part of this demo.')
            }
          >
            <ProFormText.Password
              name="current"
              label="Current password"
              rules={[{ required: true }]}
            />
            <ProFormText.Password
              name="next"
              label="New password"
              fieldProps={{ onChange: (event) => setPassword(event.target.value) }}
              rules={[{ required: true, min: 8 }]}
            />
            <ProFormText.Password
              name="confirm"
              label="Confirm new password"
              dependencies={['next']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || getFieldValue('next') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Passwords do not match')),
                }),
              ]}
            />
          </ProForm>
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Progress
              percent={(passed / PASSWORD_RULES.length) * 100}
              showInfo={false}
              status={passed === PASSWORD_RULES.length ? 'success' : 'active'}
            />
            <Typography.Text type="secondary">
              {passed === PASSWORD_RULES.length ? 'Strong' : `${passed} of 4 rules met`}: at least 8
              characters, upper and lower case, a number, a special character.
            </Typography.Text>
          </Space>
          <Button type="primary" onClick={() => void form.submit()}>
            Update Password
          </Button>
        </ProCard>

        <ProCard
          title="Two-Factor Authentication"
          headerBordered
          extra={
            <Switch
              checked={settings.twoFactor}
              onChange={(twoFactor) => {
                if (!twoFactor) {
                  apply({ twoFactor }, 'Two-factor authentication turned off');
                  return;
                }
                modal.confirm({
                  title: 'Set up two-factor authentication',
                  width: 420,
                  okText: 'Verify code',
                  content: (
                    <Space direction="vertical" size={12}>
                      <Steps
                        direction="vertical"
                        size="small"
                        items={[
                          { title: 'Open your authenticator app' },
                          { title: 'Scan the QR code' },
                          { title: 'Enter the 6-digit code to verify' },
                        ]}
                      />
                      <QRCode value={snapshot?.otpUrl ?? 'AdminPro'} size={160} />
                      <Input.OTP length={6} />
                    </Space>
                  ),
                  onOk: () =>
                    Promise.reject(
                      new Error('Verifying a code needs a backend, so this demo cannot enable it.'),
                    ),
                });
              }}
            />
          }
        >
          {settings.twoFactor ? (
            <Alert type="success" showIcon message="Two-factor authentication is enabled." />
          ) : (
            <Alert
              type="info"
              showIcon
              message="Two-factor authentication is off."
              description="Turning it on needs a backend to verify the code."
            />
          )}
        </ProCard>

        <ProCard
          title="Trusted Devices"
          headerBordered
          extra={
            <Button onClick={() => void message.info('Device management needs a backend.')}>
              Manage All Devices
            </Button>
          }
        >
          {snapshot ? deviceList(snapshot.devices) : <List loading />}
        </ProCard>

        <ProCard
          title="Active Sessions"
          headerBordered
          extra={
            <Button
              danger
              onClick={() => {
                modal.confirm({
                  title: 'Sign out all other sessions?',
                  content: 'This device stays signed in. Other sessions have to sign in again.',
                  okText: 'Sign out all',
                  okButtonProps: { danger: true },
                  onOk: () => Promise.reject(new Error('Signing sessions out needs a backend.')),
                });
              }}
            >
              Sign Out All
            </Button>
          }
        >
          {snapshot ? deviceList(snapshot.sessions) : <List loading />}
        </ProCard>

        <ProCard title="Recent Login Activity" headerBordered className="span-2">
          <Table<LoginRecord>
            rowKey="id"
            size="small"
            columns={loginColumns}
            dataSource={snapshot?.logins ?? []}
            loading={!snapshot}
            pagination={false}
            scroll={{ x: 640 }}
            rowClassName={(record) => (record.success ? '' : 'row-warning')}
          />
        </ProCard>

        <ProCard title="Security Notifications" headerBordered className="span-2">
          {NOTIFICATION_ROWS.map((row) => (
            <div className="setting-row" key={row.key}>
              <span>
                {row.title}
                <small>{row.description}</small>
              </span>
              <Switch
                checked={Boolean(settings[row.key])}
                onChange={(checked) =>
                  apply({ [row.key]: checked }, 'Notification preference updated')
                }
              />
            </div>
          ))}
        </ProCard>
      </div>

      <Modal
        title="Recovery codes"
        open={codesOpen}
        footer={null}
        onCancel={() => setCodesOpen(false)}
      >
        <Alert
          type="warning"
          showIcon
          icon={<DeleteOutlined />}
          message="Recovery codes need a backend."
          description="This demo has no second factor, so there is nothing to recover yet."
        />
      </Modal>
    </PageContainer>
  );
}
