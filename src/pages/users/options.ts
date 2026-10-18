export const ROLE_OPTIONS = ['admin', 'editor', 'viewer'].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));
export const STATUS_OPTIONS = ['active', 'inactive', 'suspended', 'pending', 'invited'].map(
  (value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }),
);
