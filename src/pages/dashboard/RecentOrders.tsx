import { MoreOutlined } from '@ant-design/icons';
import { App, Avatar, Badge, Button, Dropdown, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatCurrency } from '@/api/modules/dashboard.api';
import type { Order, OrderStatus } from '@/types';

const STATUS: Record<
  OrderStatus,
  { badge: 'success' | 'processing' | 'warning' | 'error'; label: string }
> = {
  paid: { badge: 'success', label: 'Paid' },
  processing: { badge: 'processing', label: 'Processing' },
  pending: { badge: 'warning', label: 'Pending' },
  failed: { badge: 'error', label: 'Failed' },
};

/** The five latest orders. Same ProTable conventions as the users list, minus the toolbar. */
export default function RecentOrders({ orders }: { orders: Order[] }) {
  const { message } = App.useApp();
  const columns: ColumnsType<Order> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 64,
      render: (id: number) => `#${1000 + id}`,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      render: (customer: string) => (
        <span className="order-customer">
          <Avatar
            size="small"
            style={{ background: 'var(--app-primary-bg)', color: 'var(--app-primary)' }}
          >
            {customer
              .split(' ')
              .map((word) => word[0])
              .slice(0, 2)
              .join('')}
          </Avatar>
          {customer}
        </span>
      ),
    },
    { title: 'Product', dataIndex: 'product', ellipsis: true },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right',
      width: 110,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (status: OrderStatus) => (
        <Badge status={STATUS[status].badge} text={STATUS[status].label} />
      ),
    },
    { title: 'Created At', dataIndex: 'createdAt', width: 130 },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, order) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'view', label: 'View' },
              { key: 'edit', label: 'Edit' },
              { key: 'refund', label: 'Refund', danger: true },
            ].map((item) => ({
              ...item,
              onClick: () =>
                void message.info(`${item.label} needs an orders backend, not part of this demo.`),
            })),
          }}
        >
          <Button
            size="small"
            icon={<MoreOutlined />}
            aria-label={`Actions for order ${order.id}`}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table<Order>
      rowKey="id"
      size="small"
      columns={columns}
      dataSource={orders.slice(0, 5)}
      pagination={false}
      scroll={{ x: 720 }}
    />
  );
}
