import {
  CheckCircleOutlined,
  DownloadOutlined,
  LockOutlined,
  PlusOutlined,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  DrawerForm,
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { App, Button, Card, Drawer, Empty, Form, Space } from 'antd';
import { useEffect, useState, type Key } from 'react';
import {
  createUser,
  deleteUser,
  getUserList,
  getUserStats,
  updateUser,
  type UserQueryParams,
  type UserStats,
} from '@/api/modules/user.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import MetricsRow from '@/components/MetricsRow';
import { downloadCsv } from '@/utils/csv';
import { displayName } from '@/utils/user';
import type { ApiUser, UserUpdateParams } from '@/types/api';
import { useUserTableColumns } from './UserColumn';
import { GENDER_OPTIONS, STATUS_META, STATUS_OPTIONS } from './options';

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
}

const DEFAULT_USER: UserFormValues = {
  username: '',
  email: '',
  password: '',
  firstname: '',
  lastname: '',
  phone: '',
  avatar: '',
  gender: 'other',
};

const EMPTY_STATS: UserStats = { total: 0, active: 0, inactive: 0, frozen: 0 };

const payloadFrom = (values: UserFormValues): UserUpdateParams => ({
  firstname: values.firstname || null,
  lastname: values.lastname || null,
  phone: values.phone || null,
  avatar: values.avatar || null,
  gender: values.gender || undefined,
});

export default function UserList() {
  const [form] = Form.useForm<UserFormValues>();
  const [editing, setEditing] = useState<ApiUser>();
  const [viewing, setViewing] = useState<ApiUser>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [params, setParams] = useState<UserQueryParams>({});
  const [selected, setSelected] = useState<Key[]>([]);
  const [busy, setBusy] = useState(false);
  const { message, modal } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiUser, UserQueryParams>({
    fetchData: getUserList,
    headerTitle: 'Users',
  });

  const refreshStats = async () => {
    try {
      setStats(await getUserStats());
    } catch {
      void message.error('Unable to load user summary');
    }
  };

  useEffect(() => {
    let active = true;
    getUserStats()
      .then((next) => {
        if (active) setStats(next);
      })
      .catch(() => void message.error('Unable to load user summary'));
    return () => {
      active = false;
    };
  }, [message]);

  const reload = async () => {
    await refreshStats();
    await actionRef.current?.reload();
    setSelected([]);
  };

  const perform = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      await reload();
      void message.success(success);
    } catch {
      void message.error('Unable to update users. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const openEditor = (user?: ApiUser) => {
    setEditing(user);
    form.resetFields();
    form.setFieldsValue(
      user
        ? {
            firstname: user.firstname ?? '',
            lastname: user.lastname ?? '',
            phone: user.phone ?? '',
            avatar: user.avatar ?? '',
            gender: user.gender ?? 'other',
          }
        : DEFAULT_USER,
    );
    setDrawerOpen(true);
  };

  const columns = useUserTableColumns({
    onEdit: openEditor,
    onView: setViewing,
    onDelete: (id) => perform(() => deleteUser(id), 'User removed'),
  });

  const count = (value: number) => (stats.total ? Math.round((value / stats.total) * 100) : 0);
  const hasFilters = Boolean(params.search || params.status !== undefined);

  const exportCsv = async () => {
    try {
      const rows: ApiUser[] = [];
      let page = 1;
      let total = Number.POSITIVE_INFINITY;
      while (rows.length < total) {
        const response = await getUserList({ ...params, current: page, pageSize: 100 });
        rows.push(...response.result);
        total = response.total;
        if (!response.result.length) break;
        page += 1;
      }
      downloadCsv('users.csv', [
        ['ID', 'Username', 'Name', 'Email', 'Roles', 'Status', 'Created at'],
        ...rows.map((user) => [
          user.id,
          user.username,
          displayName(user),
          user.email,
          user.roles.map((role) => role.name).join(', '),
          STATUS_META[user.status].label,
          user.created_at?.slice(0, 10) ?? '',
        ]),
      ]);
    } catch {
      void message.error('Unable to export users');
    }
  };

  return (
    <PageContainer
      title="User Management"
      subTitle="Manage accounts stored in pet-api."
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
          New User
        </Button>
      }
    >
      <div className="section-stack">
        <MetricsRow
          items={[
            {
              label: 'Total Users',
              value: stats.total,
              icon: <TeamOutlined />,
              detail: 'Across your organization',
            },
            {
              label: 'Active Users',
              value: stats.active,
              icon: <CheckCircleOutlined />,
              tone: 'success',
              trend: { text: `${count(stats.active)}%`, caption: 'of total users' },
            },
            {
              label: 'Inactive Users',
              value: stats.inactive,
              icon: <StopOutlined />,
              tone: 'warning',
              trend: { text: `${count(stats.inactive)}%`, caption: 'of total users' },
            },
            {
              label: 'Frozen Users',
              value: stats.frozen,
              icon: <LockOutlined />,
              tone: 'error',
              trend: { text: `${count(stats.frozen)}%`, caption: 'of total users' },
            },
          ]}
        />
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<UserQueryParams>
            defaultCollapsed={false}
            span={{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 }}
            labelWidth="auto"
            onFinish={(values) => {
              setParams(values);
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
            onReset={() => {
              setParams({});
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
          >
            <ProFormText name="search" label="Search" placeholder="Username, name or email" />
            <ProFormSelect
              name="status"
              label="Status"
              options={STATUS_OPTIONS}
              placeholder="All statuses"
            />
          </QueryFilter>
        </Card>
        <ProTable<ApiUser, UserQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          search={false}
          headerTitle={`${stats.total} users in total`}
          scroll={{ x: 900 }}
          defaultSize={
            settings.density === 'small'
              ? 'small'
              : settings.density === 'large'
                ? 'large'
                : 'middle'
          }
          pagination={{
            defaultPageSize: settings.pageSize,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]}–${range[1]} of ${total} results`,
          }}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: setSelected,
            preserveSelectedRowKeys: true,
          }}
          tableAlertRender={({ selectedRowKeys }) => `${selectedRowKeys.length} selected`}
          tableAlertOptionRender={() => (
            <Space wrap>
              <Button
                danger
                loading={busy}
                onClick={() => {
                  modal.confirm({
                    title: `Delete ${selected.length} users?`,
                    content: 'This permanently removes the selected accounts from pet-api.',
                    okText: 'Delete',
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      await perform(async () => {
                        for (const user of selected) await deleteUser(Number(user));
                      }, 'Selected users deleted');
                    },
                  });
                }}
              >
                Delete
              </Button>
            </Space>
          )}
          locale={{
            emptyText: (
              <Empty
                description={
                  hasFilters
                    ? 'No matching users. Adjust your filters or add a new user.'
                    : 'No users yet. Create your first user to get started.'
                }
              >
                <Button onClick={() => openEditor()}>New User</Button>
              </Empty>
            ),
          }}
          toolBarRender={() => [
            <Button key="export" icon={<DownloadOutlined />} onClick={() => void exportCsv()}>
              Export
            </Button>,
          ]}
        />
      </div>
      <DrawerForm<UserFormValues>
        title={editing ? 'Edit User' : 'New User'}
        width={560}
        form={form}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialValues={DEFAULT_USER}
        submitter={{
          searchConfig: {
            submitText: editing ? 'Save Changes' : 'Create User',
            resetText: 'Cancel',
          },
        }}
        onFinish={async (values) => {
          try {
            if (editing) await updateUser(editing.id, payloadFrom(values));
            else
              await createUser({
                username: values.username,
                email: values.email,
                password: values.password,
                firstname: values.firstname || undefined,
                lastname: values.lastname || undefined,
              });
            await reload();
            void message.success(editing ? 'User updated' : 'User created successfully');
            return true;
          } catch {
            void message.error(
              editing
                ? 'Unable to update user'
                : 'Unable to create user. Check username and email.',
            );
            return false;
          }
        }}
      >
        {!editing && (
          <>
            <ProFormText
              name="username"
              label="Username"
              rules={[{ required: true, min: 3, whitespace: true }]}
            />
            <ProFormText name="email" label="Email" rules={[{ required: true, type: 'email' }]} />
            <ProFormText.Password
              name="password"
              label="Password"
              rules={[{ required: true, min: 8, message: 'Use at least 8 characters' }]}
            />
          </>
        )}
        <ProFormText name="firstname" label="First name" />
        <ProFormText name="lastname" label="Last name" />
        <ProFormText name="phone" label="Phone" />
        <ProFormText
          name="avatar"
          label="Avatar"
          placeholder="https://example.com/photo.jpg"
          rules={[{ type: 'url', message: 'Enter a valid image URL' }]}
        />
        <ProFormSelect name="gender" label="Gender" options={GENDER_OPTIONS} />
      </DrawerForm>
      <Drawer
        title="User details"
        width={560}
        open={!!viewing}
        onClose={() => setViewing(undefined)}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" title="Basic information">
            <ProDescriptions<ApiUser>
              column={1}
              dataSource={viewing}
              columns={[
                { title: 'Username', dataIndex: 'username' },
                { title: 'Full name', render: (_, user) => displayName(user) },
                { title: 'Email', dataIndex: 'email', copyable: true },
                { title: 'Phone', dataIndex: 'phone' },
                { title: 'Gender', dataIndex: 'gender' },
                { title: 'Avatar', dataIndex: 'avatar', copyable: true, ellipsis: true },
              ]}
            />
          </Card>
          <Card size="small" title="Role & permissions">
            <ProDescriptions<ApiUser>
              column={1}
              dataSource={viewing}
              columns={[
                {
                  title: 'Roles',
                  render: (_, user) =>
                    user.roles.length ? user.roles.map((role) => role.name).join(', ') : '—',
                },
              ]}
            />
          </Card>
          <Card size="small" title="Account status">
            <ProDescriptions<ApiUser>
              column={1}
              dataSource={viewing}
              columns={[
                {
                  title: 'Status',
                  render: (_, user) => STATUS_META[user.status].label,
                },
                {
                  title: 'Created at',
                  render: (_, user) => user.created_at?.slice(0, 10) ?? '—',
                },
              ]}
            />
          </Card>
        </Space>
      </Drawer>
    </PageContainer>
  );
}
