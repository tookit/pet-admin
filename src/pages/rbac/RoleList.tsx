import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Checkbox, Drawer, Form, Space, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import {
  assignPermissionToRole,
  createPermission,
  createRole,
  getPermissionList,
  getRoleList,
  removePermissionFromRole,
} from '@/api/modules/rbac.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type { ApiPermission, ApiRole, ListParams } from '@/types/api';
import { RowActions } from '@/components/RowActions';

interface RoleFormValues {
  name: string;
  slug: string;
  description?: string;
}

const DEFAULT_ROLE: RoleFormValues = { name: '', slug: '', description: '' };

export default function RoleList() {
  const [roleForm] = Form.useForm<RoleFormValues>();
  const [permissionForm] = Form.useForm<RoleFormValues>();
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [permissionDrawerOpen, setPermissionDrawerOpen] = useState(false);
  const [managing, setManaging] = useState<ApiRole>();
  const [allPermissions, setAllPermissions] = useState<ApiPermission[]>([]);
  const [checkedPermissions, setCheckedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();
  const { settings } = useSettings();

  const roles = useProTable<ApiRole, ListParams>({
    fetchData: getRoleList,
    headerTitle: 'Roles',
  });
  const permissions = useProTable<ApiPermission, ListParams>({
    fetchData: getPermissionList,
    headerTitle: 'Permissions',
  });

  const openManage = async (role: ApiRole) => {
    setManaging(role);
    setCheckedPermissions(role.permissions.map((permission) => permission.id));
    if (!allPermissions.length) {
      try {
        const response = await getPermissionList({ per_page: 100 });
        setAllPermissions(response.result);
      } catch {
        void message.error('Unable to load permissions');
      }
    }
  };

  const savePermissions = async () => {
    if (!managing) return;
    setSaving(true);
    const current = managing.permissions.map((permission) => permission.id);
    const added = checkedPermissions.filter((id) => !current.includes(id));
    const removed = current.filter((id) => !checkedPermissions.includes(id));
    try {
      await Promise.all([
        ...added.map((id) => assignPermissionToRole(managing.id, id)),
        ...removed.map((id) => removePermissionFromRole(managing.id, id)),
      ]);
      await roles.actionRef.current?.reload();
      setManaging(undefined);
      void message.success('Permissions updated');
    } catch {
      void message.error('Unable to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const roleColumns: ProColumns<ApiRole>[] = [
    { title: 'Role', dataIndex: 'name', width: 200 },
    { title: 'Slug', dataIndex: 'slug', width: 160, render: (_, role) => <Tag>{role.slug}</Tag> },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      render: (_, role) =>
        role.permissions.length ? (
          <Space size={4} wrap>
            {role.permissions.map((permission) => (
              <Tag key={permission.id} color="blue">
                {permission.slug}
              </Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">No permissions</Typography.Text>
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      responsive: ['lg'],
      render: (_, role) => role.description || '—',
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, role) => (
        <RowActions
          label={`Actions for ${role.name}`}
          items={[
            {
              key: 'permissions',
              label: 'Manage permissions',
              onClick: () => void openManage(role),
            },
          ]}
        />
      ),
    },
  ];

  const permissionColumns: ProColumns<ApiPermission>[] = [
    { title: 'Permission', dataIndex: 'name', width: 220 },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 220,
      render: (_, permission) => <Tag>{permission.slug}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (_, permission) => permission.description || '—',
    },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      width: 140,
      responsive: ['lg'],
      render: (_, permission) => permission.created_at.slice(0, 10),
    },
  ];

  return (
    <PageContainer
      title="Access control"
      subTitle="Roles and permissions stored in pet-api. The API has no role edit or delete endpoint."
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRoleDrawerOpen(true)}>
          New Role
        </Button>
      }
    >
      <Tabs
        items={[
          {
            key: 'roles',
            label: 'Roles',
            children: (
              <ProTable<ApiRole, ListParams>
                {...roles.defaultProTableProps}
                columns={roleColumns}
                search={false}
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
                  showTotal: (total, range) =>
                    `Showing ${range[0]}–${range[1]} of ${total} results`,
                }}
              />
            ),
          },
          {
            key: 'permissions',
            label: 'Permissions',
            children: (
              <ProTable<ApiPermission, ListParams>
                {...permissions.defaultProTableProps}
                columns={permissionColumns}
                search={false}
                scroll={{ x: 800 }}
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
                  showTotal: (total, range) =>
                    `Showing ${range[0]}–${range[1]} of ${total} results`,
                }}
                toolBarRender={() => [
                  <Button
                    key="new-permission"
                    icon={<PlusOutlined />}
                    onClick={() => setPermissionDrawerOpen(true)}
                  >
                    New Permission
                  </Button>,
                ]}
              />
            ),
          },
        ]}
      />

      <DrawerForm<RoleFormValues>
        title="New Role"
        width={480}
        form={roleForm}
        open={roleDrawerOpen}
        onOpenChange={setRoleDrawerOpen}
        initialValues={DEFAULT_ROLE}
        submitter={{ searchConfig: { submitText: 'Create Role', resetText: 'Cancel' } }}
        onFinish={async (values) => {
          try {
            await createRole({
              name: values.name,
              slug: values.slug,
              description: values.description || null,
            });
            await roles.actionRef.current?.reload();
            void message.success('Role created');
            return true;
          } catch {
            void message.error('Unable to create role. Check the slug.');
            return false;
          }
        }}
      >
        <ProFormText name="name" label="Name" rules={[{ required: true, whitespace: true }]} />
        <ProFormText
          name="slug"
          label="Slug"
          rules={[
            { required: true, whitespace: true },
            { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Use lowercase kebab-case' },
          ]}
        />
        <ProFormTextArea name="description" label="Description" />
      </DrawerForm>

      <DrawerForm<RoleFormValues>
        title="New Permission"
        width={480}
        form={permissionForm}
        open={permissionDrawerOpen}
        onOpenChange={setPermissionDrawerOpen}
        initialValues={DEFAULT_ROLE}
        submitter={{ searchConfig: { submitText: 'Create Permission', resetText: 'Cancel' } }}
        onFinish={async (values) => {
          try {
            await createPermission({
              name: values.name,
              slug: values.slug,
              description: values.description || null,
            });
            await permissions.actionRef.current?.reload();
            setAllPermissions([]);
            void message.success('Permission created');
            return true;
          } catch {
            void message.error('Unable to create permission. Check the slug.');
            return false;
          }
        }}
      >
        <ProFormText name="name" label="Name" rules={[{ required: true, whitespace: true }]} />
        <ProFormText
          name="slug"
          label="Slug"
          placeholder="e.g. product:write"
          rules={[
            { required: true, whitespace: true },
            {
              pattern: /^[a-z0-9]+(?::[a-z0-9-]+)*$/,
              message: 'Use lowercase, e.g. product:write',
            },
          ]}
        />
        <ProFormTextArea name="description" label="Description" />
      </DrawerForm>

      <Drawer
        title={managing ? `Permissions for ${managing.name}` : 'Permissions'}
        width={480}
        open={!!managing}
        onClose={() => setManaging(undefined)}
        extra={
          <Space>
            <Button onClick={() => setManaging(undefined)}>Cancel</Button>
            <Button type="primary" loading={saving} onClick={() => void savePermissions()}>
              Save
            </Button>
          </Space>
        }
      >
        <Typography.Paragraph type="secondary">
          <SafetyCertificateOutlined /> Admins bypass permission checks in pet-api; this matrix
          applies to every other role.
        </Typography.Paragraph>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          value={checkedPermissions}
          onChange={(values) => setCheckedPermissions(values)}
          options={allPermissions.map((permission) => ({
            value: permission.id,
            label: (
              <Space direction="vertical" size={0}>
                <span>{permission.name}</span>
                <Typography.Text type="secondary">{permission.slug}</Typography.Text>
              </Space>
            ),
          }))}
        />
      </Drawer>
    </PageContainer>
  );
}
