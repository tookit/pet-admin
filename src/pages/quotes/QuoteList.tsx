import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProFormText, ProTable, QueryFilter } from '@ant-design/pro-components';
import {
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Skeleton,
  Table,
  Typography,
} from 'antd';
import { useCallback, useState, type ReactNode } from 'react';
import { deleteQuote, getQuote, getQuoteList } from '@/api/modules/quote.api';
import { getProduct } from '@/api/modules/product.api';
import { mediaUrl } from '@/api/modules/media.api';
import { useFilterQuery } from '@/hooks/useFilterQuery';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import { downloadCsv } from '@/utils/csv';
import { RowActions } from '@/components/RowActions';
import type { ApiProductDetail, ApiQuote, QuoteQueryParams } from '@/types/api';

const inquiryNo = (id: number) => `INQ-${String(id).padStart(4, '0')}`;
const totalUnits = (quote: ApiQuote) => quote.items.reduce((sum, item) => sum + item.quantity, 0);
const formatDate = (value: string) => value.slice(0, 16).replace('T', ' ');
const formatPrice = (value: number | null | undefined) =>
  value == null ? '—' : `$${Number(value).toFixed(2)}`;

const decodeQuoteFilters = (search: URLSearchParams): QuoteQueryParams => ({
  company: search.get('company') ?? undefined,
  name: search.get('name') ?? undefined,
  email: search.get('email') ?? undefined,
  phone: search.get('phone') ?? undefined,
});

/**
 * Inquiries (design: adminpro-design-docs/inquiry.md), adapted to pet-api:
 * quotes have no status, country, reply endpoint or timeline, so the status
 * tabs and reply/quote actions are intentionally absent.
 */
export default function QuoteList() {
  const [filterForm] = Form.useForm();
  const [detail, setDetail] = useState<ApiQuote>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [products, setProducts] = useState<Record<number, ApiProductDetail>>({});
  const [exporting, setExporting] = useState(false);
  const { message } = App.useApp();
  const { settings } = useSettings();
  const {
    params,
    apply: applyFilters,
    clear: clearFilters,
    hasFilters,
  } = useFilterQuery<QuoteQueryParams>(filterForm, decodeQuoteFilters);

  const cacheProducts = useCallback(async (ids: number[]) => {
    const unique = [...new Set(ids)];
    if (!unique.length) return;
    const loaded = await Promise.all(unique.map((id) => getProduct(id).catch(() => null)));
    setProducts((current) => {
      const next = { ...current };
      for (const product of loaded) if (product) next[product.id] = product;
      return next;
    });
  }, []);

  const fetchQuotes = useCallback(
    async (query: QuoteQueryParams) => {
      const response = await getQuoteList(query);
      void cacheProducts(
        response.result.flatMap((quote) => quote.items.map((item) => item.product_id)),
      );
      return response;
    },
    [cacheProducts],
  );

  const { actionRef, defaultProTableProps } = useProTable<ApiQuote, QuoteQueryParams>({
    fetchData: fetchQuotes,
    headerTitle: 'Inquiries',
  });

  const openDetail = async (quote: ApiQuote) => {
    setDetailLoading(true);
    setDetail(undefined);
    void cacheProducts(quote.items.map((item) => item.product_id));
    try {
      setDetail(await getQuote(quote.id));
    } catch {
      void message.error('Unable to load inquiry');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(undefined);
    setDetailLoading(false);
  };

  const remove = async (quote: ApiQuote) => {
    try {
      await deleteQuote(quote.id);
      await actionRef.current?.reload();
      void message.success('Inquiry deleted');
    } catch {
      void message.error('Unable to delete inquiry');
    }
  };

  const productName = (id: number) => products[id]?.name ?? `Product #${id}`;

  const resetFilters = () => {
    clearFilters();
    actionRef.current?.setPageInfo?.({ current: 1 });
  };

  const intent = (quote: ApiQuote) => {
    const names = quote.items
      .map((item) => products[item.product_id]?.name)
      .filter((name): name is string => Boolean(name));
    const label = names.length
      ? names.slice(0, 2).join(', ')
      : `${quote.items.length} item${quote.items.length === 1 ? '' : 's'}`;
    return quote.items.length > 1 ? `${label} × ${quote.items.length}` : label;
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: ApiQuote[] = [];
      let current = 1;
      let total = Number.POSITIVE_INFINITY;
      while (rows.length < total) {
        const response = await getQuoteList({ ...params, current, pageSize: 100 });
        rows.push(...response.result);
        total = response.total;
        if (!response.result.length) break;
        current += 1;
      }
      downloadCsv('inquiries.csv', [
        ['Inquiry', 'Company', 'Contact', 'Email', 'Phone', 'Items', 'Total quantity', 'Received'],
        ...rows.map((quote) => [
          inquiryNo(quote.id),
          quote.company,
          quote.name,
          quote.email,
          quote.phone,
          quote.items.length,
          totalUnits(quote),
          formatDate(quote.created_at),
        ]),
      ]);
    } catch {
      void message.error('Unable to export inquiries');
    } finally {
      setExporting(false);
    }
  };

  const columns: ProColumns<ApiQuote>[] = [
    {
      title: 'Inquiry',
      dataIndex: 'id',
      width: 110,
      render: (_, quote) => (
        <Typography.Text className="inquiry-no">{inquiryNo(quote.id)}</Typography.Text>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'company',
      width: 250,
      render: (_, quote) => (
        <div className="inquiry-customer">
          <span className="inquiry-customer__company">{quote.company || quote.name}</span>
          <span className="inquiry-customer__contact">{quote.name}</span>
        </div>
      ),
    },
    {
      title: 'Intent',
      dataIndex: 'items',
      width: 260,
      render: (_, quote) => <span>{intent(quote)}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 110,
      align: 'right',
      render: (_, quote) => <span className="inquiry-qty">{totalUnits(quote)} pcs</span>,
    },
    {
      title: 'Received',
      dataIndex: 'created_at',
      width: 160,
      render: (_, quote) => <span className="muted-time">{formatDate(quote.created_at)}</span>,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, quote) => (
        <div onClick={(event) => event.stopPropagation()}>
          <RowActions
            label={`Actions for ${inquiryNo(quote.id)}`}
            items={[{ key: 'view', label: 'View details', onClick: () => void openDetail(quote) }]}
            deleteTitle={`Delete ${inquiryNo(quote.id)}?`}
            deleteContent="This permanently removes the request from pet-api."
            onDelete={() => remove(quote)}
          />
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Inquiries"
      subTitle="Buyer RFQ inbox — received → quoted → won."
      extra={
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={() => void exportCsv()}>
          Export CSV
        </Button>
      }
    >
      <div className="section-stack">
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<QuoteQueryParams>
            form={filterForm}
            className="list-query"
            colon={false}
            defaultCollapsed
            span={{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 }}
            labelWidth="auto"
            submitter={{
              searchConfig: { submitText: 'Query', resetText: 'Reset' },
              render: (_: unknown, dom: ReactNode[]) => [dom[1], dom[0]],
            }}
            onFinish={(values) => {
              applyFilters(values);
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
            onReset={resetFilters}
          >
            <ProFormText name="company" label="Company" />
            <ProFormText name="name" label="Contact" />
            <ProFormText name="email" label="Email" />
            <ProFormText name="phone" label="Phone" />
          </QueryFilter>
        </Card>
        <ProTable<ApiQuote, QuoteQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          headerTitle={false}
          search={false}
          scroll={{ x: 960 }}
          onRow={(quote) => ({
            onClick: () => void openDetail(quote),
            style: { cursor: 'pointer' },
          })}
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
          locale={{
            emptyText: (
              <Empty
                className="list-empty"
                description={
                  hasFilters
                    ? 'No inquiries match these filters.'
                    : 'No inquiries yet. New RFQs arrive here.'
                }
              >
                {hasFilters && <Button onClick={resetFilters}>Reset filters</Button>}
              </Empty>
            ),
          }}
        />
      </div>

      <Drawer
        title={detail ? inquiryNo(detail.id) : 'Inquiry'}
        width={430}
        open={detailLoading || !!detail}
        onClose={closeDetail}
        footer={
          <Button block onClick={closeDetail}>
            Close
          </Button>
        }
      >
        {detailLoading || !detail ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="inquiry-detail">
            <section>
              <h4 className="inquiry-section-title">Customer</h4>
              <Descriptions
                column={1}
                size="small"
                colon={false}
                labelStyle={{ width: 88, color: 'var(--app-muted)' }}
                items={[
                  { key: 'company', label: 'Company', children: detail.company || '—' },
                  { key: 'name', label: 'Contact', children: detail.name },
                  {
                    key: 'email',
                    label: 'Email',
                    children: (
                      <Typography.Text copyable className="mono">
                        {detail.email}
                      </Typography.Text>
                    ),
                  },
                  { key: 'phone', label: 'Phone', children: detail.phone || '—' },
                  {
                    key: 'received',
                    label: 'Received',
                    children: formatDate(detail.created_at),
                  },
                ]}
              />
            </section>

            <section>
              <h4 className="inquiry-section-title">Requested items</h4>
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
                    render: (_, item) => (
                      <div className="inquiry-item-product">
                        <Avatar
                          shape="square"
                          size={32}
                          src={mediaUrl(
                            products[item.product_id]?.featured_image ??
                              products[item.product_id]?.images.find((image) => image.featured)
                                ?.url ??
                              products[item.product_id]?.images[0]?.url ??
                              null,
                          )}
                          icon={<InboxOutlined />}
                        />
                        <div className="inquiry-item-product__body">
                          <span className="inquiry-item-product__name">
                            {productName(item.product_id)}
                          </span>
                          <span className="inquiry-item-product__sku">
                            {products[item.product_id]?.sku ?? `#${item.product_id}`}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Qty',
                    dataIndex: 'quantity',
                    width: 48,
                    align: 'right',
                    className: 'tabular-nums',
                  },
                  {
                    title: 'Ref. price',
                    dataIndex: 'unit_price',
                    width: 76,
                    align: 'right',
                    render: (_, item) => (
                      <span className="inquiry-ref-price">
                        {formatPrice(products[item.product_id]?.min_price)}
                      </span>
                    ),
                  },
                ]}
              />
            </section>

            <section>
              <h4 className="inquiry-section-title">Customer message</h4>
              <blockquote className="inquiry-message">
                {detail.notes ? detail.notes : 'No message provided.'}
              </blockquote>
            </section>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
}
