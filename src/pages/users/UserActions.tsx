import { MoreOutlined } from '@ant-design/icons';
import { App, Button, Dropdown } from 'antd';
import type { User } from '@/types';
interface Props {
  record: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDuplicate: (user: User) => void;
  onDisable: (user: User) => void;
  onDelete: (id: number) => Promise<void>;
}
export function UserActions({ record, onEdit, onView, onDuplicate, onDisable, onDelete }: Props) {
  const { modal } = App.useApp();
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'view', label: 'View details', onClick: () => onView(record) },
          { key: 'edit', label: 'Edit', onClick: () => onEdit(record) },
          { key: 'duplicate', label: 'Duplicate', onClick: () => onDuplicate(record) },
          {
            key: 'disable',
            label: record.status === 'inactive' ? 'Activate' : 'Disable',
            onClick: () => onDisable(record),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: 'Delete',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: `Delete ${record.name}?`,
                content: 'This removes the user from the local demo.',
                okText: 'Delete',
                okButtonProps: { danger: true },
                onOk: () => onDelete(record.id),
              });
            },
          },
        ],
      }}
    >
      <Button size="small" icon={<MoreOutlined />} aria-label={`Actions for ${record.name}`} />
    </Dropdown>
  );
}
