import type { ApiUser } from '@/types/api';
import { displayName } from '@/utils/user';
import { RowActions } from '@/components/RowActions';

interface Props {
  record: ApiUser;
  onEdit: (user: ApiUser) => void;
  onView: (user: ApiUser) => void;
  onDelete: (id: number) => Promise<void>;
  onManageRoles: (user: ApiUser) => void;
}

export function UserActions({ record, onEdit, onView, onDelete, onManageRoles }: Props) {
  return (
    <RowActions
      label={`Actions for ${displayName(record)}`}
      items={[
        { key: 'view', label: 'View details', onClick: () => onView(record) },
        { key: 'edit', label: 'Edit', onClick: () => onEdit(record) },
        { key: 'roles', label: 'Manage roles', onClick: () => onManageRoles(record) },
      ]}
      deleteTitle={`Delete ${displayName(record)}?`}
      deleteContent="This permanently removes the account from pet-api."
      onDelete={() => onDelete(record.id)}
    />
  );
}
