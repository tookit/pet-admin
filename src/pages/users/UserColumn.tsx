import { Avatar, Badge, Space, Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import type { ComponentProps } from 'react';
import type { User } from '@/types';
import { UserActions } from './UserActions';
export function useUserTableColumns(
  actions: Omit<ComponentProps<typeof UserActions>, 'record'>,
): ProColumns<User>[] {
  return [
    { title: '#', dataIndex: 'id', width: 64, responsive: ['lg'] },
    {
      title: 'User',
      dataIndex: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, user) => (
        <Space>
          <Avatar
            src={user.avatar}
            style={{ background: 'var(--app-primary-bg)', color: 'var(--app-primary)' }}
          >
            {user.name
              .split(' ')
              .map((word) => word[0])
              .slice(0, 2)
              .join('')}
          </Avatar>
          <a onClick={() => actions.onView(user)}>{user.name}</a>
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
      title: 'Role',
      dataIndex: 'role',
      width: 100,
      render: (_, user) => (
        <Tag color={user.role === 'admin' ? 'red' : user.role === 'editor' ? 'blue' : 'default'}>
          {user.role[0].toUpperCase() + user.role.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 115,
      render: (_, user) => (
        <Badge
          status={
            user.status === 'active'
              ? 'success'
              : user.status === 'suspended'
                ? 'error'
                : user.status === 'inactive'
                  ? 'default'
                  : 'warning'
          }
          text={user.status[0].toUpperCase() + user.status.slice(1)}
        />
      ),
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      width: 130,
      responsive: ['lg'],
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
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
