import { MoreOutlined } from '@ant-design/icons';
import { App, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

interface Props {
  label: string;
  items: NonNullable<MenuProps['items']>;
  deleteTitle?: string;
  deleteContent?: string;
  onDelete?: () => void | Promise<void>;
}

/** Row action menu shared by every list screen, matching User Management. */
export function RowActions({ label, items, deleteTitle, deleteContent, onDelete }: Props) {
  const { modal } = App.useApp();

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: onDelete
          ? [
              ...items,
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => {
                  modal.confirm({
                    title: deleteTitle ?? 'Delete this record?',
                    content: deleteContent,
                    okText: 'Delete',
                    okButtonProps: { danger: true },
                    onOk: () => onDelete(),
                  });
                },
              },
            ]
          : items,
      }}
    >
      <Button size="small" icon={<MoreOutlined />} aria-label={label} />
    </Dropdown>
  );
}
