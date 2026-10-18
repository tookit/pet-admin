import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  DrawerForm,
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { App, Button, Card, Drawer, Empty, Form, Space } from 'antd';
import { useEffect, useState, type Key } from 'react';
import { deleteUser, getAllUsers, getUserList, saveUser } from '@/api/modules/user.api';
import type { UserListParams } from '@/api/modules/user.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import MetricsRow from '@/components/MetricsRow';
import { downloadCsv } from '@/utils/csv';
import type { User, UserFormValues } from '@/types';
import { useUserTableColumns } from './UserColumn';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './options';
const DEFAULT_USER: UserFormValues = {
  name: '',
  email: '',
  role: 'viewer',
  status: 'invited',
  phone: '',
  department: '',
  notes: '',
};
export default function UserList() {
  const [form] = Form.useForm<UserFormValues>();
  const [editing, setEditing] = useState<User>();
  const [viewing, setViewing] = useState<User>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [params, setParams] = useState<UserListParams>({});
  const [selected, setSelected] = useState<Key[]>([]);
  const [busy, setBusy] = useState(false);
  const { message, modal } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<User, UserListParams>({
    fetchData: getUserList,
    headerTitle: 'Users',
  });
  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((all) => {
        if (active) setUsers(all);
      })
      .catch(() => void message.error('Unable to load user summary'));
    return () => {
      active = false;
    };
  }, [message]);
  const reload = async () => {
    setUsers(await getAllUsers());
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
  const openEditor = (user?: User) => {
    setEditing(user);
    form.resetFields();
    form.setFieldsValue(user ?? DEFAULT_USER);
    setDrawerOpen(true);
  };
  const columns = useUserTableColumns({
    onEdit: openEditor,
    onView: setViewing,
    onDuplicate: (user) => {
      openEditor();
      form.setFieldsValue({ ...user, name: `${user.name} (copy)`, email: '' });
    },
    onDisable: (user) =>
      void perform(
        () => saveUser({ ...user, status: user.status === 'inactive' ? 'active' : 'inactive' }),
        'User status updated',
      ),
    onDelete: (id) => perform(() => deleteUser(id), 'User removed'),
  });
  const bulk = (action: 'active' | 'inactive' | 'delete') =>
    perform(async () => {
      for (const user of users.filter((item) => selected.includes(item.id))) {
        if (action === 'delete') await deleteUser(user.id);
        else await saveUser({ ...user, status: action });
      }
    }, 'Selected users updated');
  const count = (predicate: (user: User) => boolean) => users.filter(predicate).length;
  const share = (part: number) => (users.length ? Math.round((part / users.length) * 100) : 0);
  const hasFilters = Boolean(params.name || params.email || params.role || params.status);
  return (
    <PageContainer
      title="User Management"
      subTitle="Manage your team members, roles and account permissions."
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
              value: users.length,
              icon: <TeamOutlined />,
              detail: 'Across your organization',
            },
            {
              label: 'Active Users',
              value: count((user) => user.status === 'active'),
              icon: <UserOutlined />,
              tone: 'success',
              trend: {
                text: `${share(count((user) => user.status === 'active'))}%`,
                caption: 'of total users',
              },
            },
            {
              label: 'Admins',
              value: count((user) => user.role === 'admin'),
              icon: <SafetyOutlined />,
              tone: 'error',
              trend: {
                text: `${share(count((user) => user.role === 'admin'))}%`,
                caption: 'of total users',
              },
            },
            {
              label: 'Editors',
              value: count((user) => user.role === 'editor'),
              icon: <EditOutlined />,
              tone: 'purple',
              trend: {
                text: `${share(count((user) => user.role === 'editor'))}%`,
                caption: 'of total users',
              },
            },
          ]}
        />
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<UserListParams>
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
            <ProFormText name="name" label="Display name" placeholder="Search by name" />
            <ProFormText name="email" label="Email" placeholder="Search by email" />
            <ProFormSelect
              name="role"
              label="Role"
              options={ROLE_OPTIONS}
              placeholder="All roles"
            />
            <ProFormSelect
              name="status"
              label="Status"
              options={STATUS_OPTIONS}
              placeholder="All statuses"
            />
          </QueryFilter>
        </Card>
        <ProTable<User, UserListParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          search={false}
          headerTitle={`${users.length} users in total`}
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
              <Button loading={busy} onClick={() => void bulk('active')}>
                Activate
              </Button>
              <Button loading={busy} onClick={() => void bulk('inactive')}>
                Disable
              </Button>
              <Button
                danger
                loading={busy}
                onClick={() => {
                  modal.confirm({
                    title: `Delete ${selected.length} users?`,
                    content: 'This removes the selected local records.',
                    okText: 'Delete',
                    okButtonProps: { danger: true },
                    onOk: () => bulk('delete'),
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
            <Button
              key="export"
              icon={<DownloadOutlined />}
              onClick={() => {
                void getUserList({ ...params, current: 1, pageSize: Math.max(users.length, 1) })
                  .then(({ result }) =>
                    downloadCsv('users.csv', [
                      ['ID', 'Name', 'Email', 'Role', 'Status', 'Created at'],
                      ...result.map((user) => [
                        user.id,
                        user.name,
                        user.email,
                        user.role,
                        user.status,
                        user.createdAt,
                      ]),
                    ]),
                  )
                  .catch(() => message.error('Unable to export users'));
              }}
            >
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
            await saveUser({ ...values, id: editing?.id });
            await reload();
            void message.success(editing ? 'User updated' : 'User created successfully');
            return true;
          } catch {
            void message.error('Unable to save user');
            return false;
          }
        }}
      >
        <ProFormText
          name="avatar"
          label="Avatar"
          placeholder="https://example.com/photo.jpg"
          tooltip="Pasted image URL. Uploads need a storage backend."
          rules={[{ type: 'url', message: 'Enter a valid image URL' }]}
        />
        <ProFormText
          name="name"
          label="Display name"
          rules={[{ required: true, whitespace: true }]}
        />
        <ProFormText name="email" label="Email" rules={[{ required: true, type: 'email' }]} />
        <ProFormSelect
          name="role"
          label="Role"
          options={ROLE_OPTIONS}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="status"
          label="Status"
          options={STATUS_OPTIONS}
          rules={[{ required: true }]}
        />
        <ProFormText name="phone" label="Phone" />
        <ProFormText name="department" label="Department" />
        <ProFormTextArea
          name="notes"
          label="Notes"
          fieldProps={{ maxLength: 500, showCount: true }}
        />
      </DrawerForm>
      <Drawer
        title="User details"
        width={560}
        open={!!viewing}
        onClose={() => setViewing(undefined)}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" title="Basic information">
            <ProDescriptions<User>
              column={1}
              dataSource={viewing}
              columns={[
                { title: 'Display name', dataIndex: 'name' },
                { title: 'Email', dataIndex: 'email', copyable: true },
                { title: 'Phone', dataIndex: 'phone' },
                { title: 'Department', dataIndex: 'department' },
                { title: 'Notes', dataIndex: 'notes' },
              ]}
            />
          </Card>
          <Card size="small" title="Role & permissions">
            <ProDescriptions<User>
              column={1}
              dataSource={viewing}
              columns={[
                { title: 'Role', dataIndex: 'role' },
                {
                  title: 'Access level',
                  render: (_, user) =>
                    user.role === 'admin'
                      ? 'Full access, including billing'
                      : user.role === 'editor'
                        ? 'Create and edit content'
                        : 'Read-only access',
                },
              ]}
            />
          </Card>
          <Card size="small" title="Account status">
            <ProDescriptions<User>
              column={1}
              dataSource={viewing}
              columns={[
                { title: 'Status', dataIndex: 'status' },
                { title: 'Created at', dataIndex: 'createdAt' },
              ]}
            />
          </Card>
        </Space>
      </Drawer>
    </PageContainer>
  );
}
