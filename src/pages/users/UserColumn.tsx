import { Avatar, Badge, Space, Tag, Typography } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import type { ComponentProps } from 'react';
import type { ApiUser } from '@/types/api';
import { displayName } from '@/utils/user';
import { STATUS_META } from './options';
import { UserActions } from './UserActions';

export function useUserTableColumns(
  actions: Omit<ComponentProps<typeof UserActions>, 'record'>,
): ProColumns<ApiUser>[] {
  return [
    { title: '#', dataIndex: 'id', width: 64, responsive: ['lg'] },
    {
      title: 'User',
      dataIndex: 'username',
      width: 220,
      render: (_, user) => (
        <Space>
          <Avatar src={user.avatar} style={{ background: 'var(--app-primary-bg)' }}>
            {displayName(user).slice(0, 2).toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <a onClick={() => actions.onView(user)}>{displayName(user)}</a>
            <Typography.Text type="secondary">@{user.username}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
      copyable: true,
      width: 240,
      responsive: ['md'],
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      width: 160,
      render: (_, user) =>
        user.roles.length ? (
          <Space size={4} wrap>
            {user.roles.map((role) => (
              <Tag key={role.id} color={role.slug === 'admin' ? 'red' : 'blue'}>
                {role.name}
              </Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 115,
      render: (_, user) => {
        const meta = STATUS_META[user.status];
        return <Badge status={meta.badge} text={meta.label} />;
      },
    },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      width: 130,
      responsive: ['lg'],
      render: (_, user) => (user.created_at ? user.created_at.slice(0, 10) : '—'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, user) => <UserActions {...actions} record={user} />,
    },
  ];
}
