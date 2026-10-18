import { MoreOutlined } from '@ant-design/icons';
import { App, Button, Dropdown } from 'antd';
import type { ApiUser } from '@/types/api';
import { displayName } from '@/utils/user';

interface Props {
  record: ApiUser;
  onEdit: (user: ApiUser) => void;
  onView: (user: ApiUser) => void;
  onDelete: (id: number) => Promise<void>;
}

export function UserActions({ record, onEdit, onView, onDelete }: Props) {
  const { modal } = App.useApp();
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'view', label: 'View details', onClick: () => onView(record) },
          { key: 'edit', label: 'Edit', onClick: () => onEdit(record) },
          { type: 'divider' },
          {
            key: 'delete',
            label: 'Delete',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: `Delete ${displayName(record)}?`,
                content: 'This permanently removes the account from pet-api.',
                okText: 'Delete',
                okButtonProps: { danger: true },
                onOk: () => onDelete(record.id),
              });
            },
          },
        ],
      }}
    >
      <Button size="small" icon={<MoreOutlined />} aria-label={`Actions for ${displayName(record)}`} />
    </Dropdown>
  );
}
