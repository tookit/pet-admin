import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { App, Card, Drawer, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { deleteQuote, getQuote, getQuoteList } from '@/api/modules/quote.api';
import { getProduct } from '@/api/modules/product.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type { ApiQuote, QuoteQueryParams } from '@/types/api';
import { RowActions } from '@/components/RowActions';

export default function QuoteList() {
  const [params, setParams] = useState<QuoteQueryParams>({});
  const [detail, setDetail] = useState<ApiQuote>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const { message } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiQuote, QuoteQueryParams>({
    fetchData: getQuoteList,
    headerTitle: 'Quotes',
  });

  const openDetail = async (quote: ApiQuote) => {
    setDetailLoading(true);
    setDetail(undefined);
    try {
      const next = await getQuote(quote.id);
      setDetail(next);
      const uniqueIds = [...new Set(next.items.map((item) => item.product_id))];
      const resolved = await Promise.all(
        uniqueIds.map((id) =>
          getProduct(id)
            .then((product) => [id, product.name] as const)
            .catch(() => [id, `Product #${id}`] as const),
        ),
      );
      setProductNames(Object.fromEntries(resolved));
    } catch {
      void message.error('Unable to load quote');
    } finally {
      setDetailLoading(false);
    }
  };

  const remove = async (quote: ApiQuote) => {
    try {
      await deleteQuote(quote.id);
      await actionRef.current?.reload();
      void message.success('Quote deleted');
    } catch {
      void message.error('Unable to delete quote');
    }
  };

  const columns: ProColumns<ApiQuote>[] = [
    { title: '#', dataIndex: 'id', width: 70, responsive: ['lg'] },
    {
      title: 'Customer',
      dataIndex: 'name',
      width: 220,
      render: (_, quote) => (
        <Space direction="vertical" size={0}>
          <a onClick={() => void openDetail(quote)}>{quote.name}</a>
          <Typography.Text type="secondary">{quote.company}</Typography.Text>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', copyable: true, width: 230, responsive: ['md'] },
    { title: 'Phone', dataIndex: 'phone', width: 150, responsive: ['lg'] },
    {
      title: 'Items',
      dataIndex: 'items',
      width: 90,
      render: (_, quote) => <Tag>{quote.items.length}</Tag>,
    },
    {
      title: 'Received',
      dataIndex: 'created_at',
      width: 150,
      render: (_, quote) => quote.created_at.slice(0, 16).replace('T', ' '),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, quote) => (
        <RowActions
          label={`Actions for quote ${quote.id}`}
          items={[
            {
              key: 'view',
              label: 'View details',
              onClick: () => void openDetail(quote),
            },
          ]}
          deleteTitle={`Delete quote from ${quote.name}?`}
          deleteContent="This permanently removes the request from pet-api."
          onDelete={() => remove(quote)}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Quotes"
      subTitle="Wholesale quote requests submitted from the storefront."
    >
      <div className="section-stack">
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<QuoteQueryParams>
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
            <ProFormText name="name" label="Name" />
            <ProFormText name="email" label="Email" />
            <ProFormText name="phone" label="Phone" />
            <ProFormText name="company" label="Company" />
          </QueryFilter>
        </Card>
        <ProTable<ApiQuote, QuoteQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
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
            showTotal: (total, range) => `Showing ${range[0]}–${range[1]} of ${total} results`,
          }}
        />
      </div>

      <Drawer
        title={detail ? `Quote #${detail.id}` : 'Quote details'}
        width={600}
        open={detailLoading || !!detail}
        loading={detailLoading}
        onClose={() => setDetail(undefined)}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" title="Requester">
              <ProDescriptions<ApiQuote>
                column={1}
                dataSource={detail}
                columns={[
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'Company', dataIndex: 'company' },
                  { title: 'Email', dataIndex: 'email', copyable: true },
                  { title: 'Phone', dataIndex: 'phone' },
                  {
                    title: 'Received',
                    render: (_, quote) => quote.created_at.slice(0, 16).replace('T', ' '),
                  },
                  { title: 'IP address', dataIndex: 'ip_address' },
                  { title: 'Notes', dataIndex: 'notes', render: (_, quote) => quote.notes || '—' },
                ]}
              />
            </Card>
            <Card size="small" title="Requested items">
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={detail.items}
                locale={{ emptyText: 'No line items.' }}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'product_id',
                    render: (_, item) =>
                      productNames[item.product_id] ?? `Product #${item.product_id}`,
                  },
                  { title: 'Quantity', dataIndex: 'quantity', width: 110 },
                ]}
              />
            </Card>
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
}
