import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  InboxOutlined,
  PictureOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import {
  App,
  Avatar,
  Button,
  Card,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState, type Key, type ReactNode } from 'react';
import dayjs from 'dayjs';
import {
  addPriceTier,
  deletePriceTier,
  deleteProduct,
  duplicateProduct,
  getPriceTiers,
  getProduct,
  getProductList,
  getProductStats,
  updateProduct,
  type ProductStats,
} from '@/api/modules/product.api';
import { getCategoryTree } from '@/api/modules/category.api';
import { getTagList } from '@/api/modules/tag.api';
import {
  getMediaList,
  mediaUrl,
  setProductFeaturedImage,
  syncEntityMedia,
} from '@/api/modules/media.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type {
  ApiMedia,
  ApiProduct,
  ApiProductDetail,
  CategoryTree,
  PriceTier,
  ProductQueryParams,
  ProductStatus,
} from '@/types/api';
import {
  FEATURED_OPTIONS,
  PRODUCT_STATUS_META,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
} from './options';
import ProductForm from './ProductForm';

const EMPTY_STATS: ProductStats = { total: 0, active: 0, draft: 0, archived: 0 };

interface CategoryTreeOption {
  title: string;
  value: number;
  children?: CategoryTreeOption[];
}

const toCategoryTreeOptions = (nodes: CategoryTree[]): CategoryTreeOption[] =>
  nodes.map((node) => ({
    title: node.name,
    value: node.id,
    children: node.children.length ? toCategoryTreeOptions(node.children) : undefined,
  }));

const currencySymbol = (currency: string) =>
  currency === 'CNY' ? '¥' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

const formatMoney = (value: number | null | undefined, currency = 'USD') =>
  value == null ? '—' : `${currencySymbol(currency)}${Number(value).toFixed(2)}`;

const formatDateTime = (value: string | null) =>
  value ? value.slice(0, 16).replace('T', ' ') : '—';

export default function ProductList() {
  const [tierForm] = Form.useForm<{ min_quantity: number; unit_price: number; label?: string }>();
  const [filterForm] = Form.useForm();
  const [editing, setEditing] = useState<ApiProduct>();
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<ApiProductDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageOptions, setImageOptions] = useState<ApiMedia[]>([]);
  const [imageSelection, setImageSelection] = useState<number[]>([]);
  const [imageSaving, setImageSaving] = useState(false);
  const [stats, setStats] = useState<ProductStats>(EMPTY_STATS);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const [params, setParams] = useState<ProductQueryParams>({});
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [tagOptions, setTagOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [tiersByProduct, setTiersByProduct] = useState<Record<number, PriceTier[]>>({});
  const tierCache = useRef<Record<number, PriceTier[]>>({});
  const { message, modal } = App.useApp();
  const { settings } = useSettings();

  /**
   * The list payload carries only `min_price` / `moq`, but the design requires
   * the first two price steps. Fetch tiers per visible row and cache them so
   * paging back does not refetch.
   */
  const fetchProducts = useCallback(async (query: ProductQueryParams) => {
    const response = await getProductList(query);
    const missing = [...new Set(response.result.map((product) => product.id))].filter(
      (id) => !(id in tierCache.current),
    );
    if (missing.length) {
      for (const id of missing) tierCache.current[id] = [];
      void Promise.all(
        missing.map(async (id) => {
          try {
            tierCache.current[id] = await getPriceTiers(id);
          } catch {
            delete tierCache.current[id];
          }
        }),
      ).then(() => setTiersByProduct({ ...tierCache.current }));
    }
    return response;
  }, []);

  const { actionRef, defaultProTableProps } = useProTable<ApiProduct, ProductQueryParams>({
    fetchData: fetchProducts,
    headerTitle: 'Products',
  });

  const categoryTreeData = useMemo(() => toCategoryTreeOptions(categoryTree), [categoryTree]);

  const loadOptions = useCallback(async () => {
    const [tree, tags] = await Promise.all([getCategoryTree(true), getTagList({ per_page: 100 })]);
    return {
      tree,
      tags: tags.result.map((tag) => ({ value: tag.name, label: tag.name })),
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadOptions()
      .then((options) => {
        if (!active) return;
        setCategoryTree(options.tree);
        setTagOptions(options.tags);
      })
      .catch(() => void message.error('Unable to load categories and tags'));
    getProductStats()
      .then((next) => {
        if (active) setStats(next);
      })
      .catch(() => void message.error('Unable to load product summary'));
    return () => {
      active = false;
    };
  }, [message, loadOptions]);

  const reload = async () => {
    tierCache.current = {};
    setTiersByProduct({});
    try {
      setStats(await getProductStats());
    } catch {
      void message.error('Unable to load product summary');
    }
    await actionRef.current?.reload();
  };

  const resetFilters = () => {
    filterForm.resetFields();
    setParams({});
    actionRef.current?.setPageInfo?.({ current: 1 });
  };

  const perform = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      await reload();
      void message.success(success);
    } catch {
      void message.error('Unable to update products. Please try again.');
    }
  };

  /** Batch status change over the current table selection (design §5: toolbar). */
  const batchUpdateStatus = (status: ProductStatus) => {
    const ids = selectedKeys.map(Number);
    if (!ids.length) return;
    void perform(
      async () => {
        await Promise.all(ids.map((id) => updateProduct(id, { status })));
        setSelectedKeys([]);
      },
      `${ids.length} product${ids.length > 1 ? 's' : ''} updated`,
    );
  };

  /** Export the filtered catalog (first 1,000 rows) as CSV. */
  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await getProductList({ pageSize: 1000 });
      const header = ['SKU', 'Name', 'Status', 'Type', 'Min price (USD)', 'MOQ', 'Created at'];
      const rows = response.result.map((product) => [
        product.sku,
        product.name,
        product.status,
        product.type,
        product.min_price != null ? Number(product.min_price).toFixed(2) : '',
        product.moq,
        product.created_at?.slice(0, 10) ?? '',
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${dayjs().format('YYYYMMDD')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      void message.error('Unable to export products');
    } finally {
      setExporting(false);
    }
  };

  const openEditor = (product?: ApiProduct) => {
    setEditing(product);
    setFormOpen(true);
  };

  const openDetail = async (product: ApiProduct) => {
    setDetailLoading(true);
    setDetail(undefined);
    try {
      const next = await getProduct(product.id);
      setDetail(next);
      setTiers(next.tiers.length ? next.tiers : await getPriceTiers(product.id));
    } catch {
      void message.error('Unable to load product details');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshTiers = async (productId: number) => {
    setTiers(await getPriceTiers(productId));
  };

  const refreshDetail = async (productId: number) => {
    const next = await getProduct(productId);
    setDetail(next);
    setTiers(next.tiers);
  };

  const openImages = async () => {
    if (!detail) return;
    setImageSelection(detail.images.map((image) => image.id));
    setImageModalOpen(true);
    if (!imageOptions.length) {
      try {
        const response = await getMediaList({ aggregate_type: 'image', pageSize: 100 });
        setImageOptions(response.result);
      } catch {
        void message.error('Unable to load the media library');
      }
    }
  };

  const saveImages = async () => {
    if (!detail) return;
    setImageSaving(true);
    try {
      await syncEntityMedia('Product', detail.id, imageSelection);
      await refreshDetail(detail.id);
      setImageModalOpen(false);
      void message.success('Product images updated');
    } catch {
      void message.error('Unable to update product images');
    } finally {
      setImageSaving(false);
    }
  };

  const featureImage = async (mediaId: number) => {
    if (!detail) return;
    try {
      await setProductFeaturedImage(detail.id, mediaId);
      await refreshDetail(detail.id);
      void message.success('Featured image updated');
    } catch {
      void message.error('Unable to set the featured image');
    }
  };

  const confirmDelete = (product: ApiProduct) => {
    modal.confirm({
      title: `Delete ${product.name}?`,
      content: 'This soft-deletes the product in pet-api.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => perform(() => deleteProduct(product.id), 'Product deleted'),
    });
  };

  const priceLadder = (product: ApiProduct) => {
    const steps = [...(tiersByProduct[product.id] ?? [])]
      .sort((a, b) => a.min_quantity - b.min_quantity)
      .slice(0, 2);
    if (steps.length) {
      return steps
        .map((tier) => `${formatMoney(tier.unit_price, tier.currency)} / ${tier.min_quantity}+`)
        .join(' · ');
    }
    return product.min_price != null
      ? `${formatMoney(product.min_price, 'USD')} / ${product.moq}+`
      : '—';
  };

  const hasFilters = Object.values(params).some((value) => value !== undefined && value !== '');

  const columns: ProColumns<ApiProduct>[] = [
    {
      title: 'Product',
      dataIndex: 'name',
      width: 260,
      render: (_: unknown, product: ApiProduct) => (
        <div className="product-cell">
          <Avatar
            className="product-cell__thumb"
            shape="square"
            size={36}
            src={mediaUrl(
              product.featured_image ??
                product.images.find((image) => image.featured)?.url ??
                product.images[0]?.url ??
                null,
            )}
            icon={<InboxOutlined />}
          />
          <div className="product-cell__body">
            <span className="product-cell__name">
              {product.name}
              {product.is_featured && (
                <StarFilled style={{ marginLeft: 6, color: 'var(--app-warning)' }} />
              )}
            </span>
            <span className="product-cell__sku">{product.sku}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      width: 170,
      render: (_: unknown, product: ApiProduct) =>
        product.categories.length ? (
          <Space size={4} wrap>
            {product.categories.map((category) => (
              <Tag key={category.id} className="category-tag">
                {category.name}
              </Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Price ladder (MOQ)',
      dataIndex: 'min_price',
      width: 190,
      render: (_: unknown, product: ApiProduct) => (
        <span className="price-ladder">{priceLadder(product)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (_: unknown, product: ApiProduct) => {
        const meta = PRODUCT_STATUS_META[product.status];
        return <span className={`status-pill status-pill--${meta.tone}`}>{meta.label}</span>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 140,
      responsive: ['lg' as const],
      render: (_: unknown, product: ApiProduct) => (
        <span className="muted-time">{formatDateTime(product.created_at)}</span>
      ),
    },
    {
      title: 'Actions',
      valueType: 'option' as const,
      key: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, product: ApiProduct) => (
        <div className="table-inline-actions" onClick={(event) => event.stopPropagation()}>
          <Button type="link" size="small" onClick={() => openEditor(product)}>
            Edit
          </Button>
          <Button type="link" size="small" onClick={() => void openDetail(product)}>
            Preview
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'duplicate',
                  label: 'Duplicate',
                  onClick: () =>
                    void perform(
                      () => duplicateProduct(product.id).then(() => {}),
                      'Product duplicated',
                    ),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete',
                  danger: true,
                  onClick: () => confirmDelete(product),
                },
              ],
            }}
          >
            <Button type="link" size="small">
              More <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Products"
      subTitle={`${stats.total.toLocaleString()} products in the catalog · ${stats.draft.toLocaleString()} drafts`}
      extra={
        <Space>
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={() => void exportCsv()}>
            Export CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New Product
          </Button>
        </Space>
      }
    >
      <div className="section-stack">
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<ProductQueryParams>
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
              setParams(values);
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
            onReset={resetFilters}
          >
            <ProFormText name="search" label="Name or SKU" placeholder="Search name or SKU" />
            <ProFormTreeSelect
              name="category_id"
              label="Category"
              placeholder="All categories"
              allowClear
              fieldProps={{
                treeData: categoryTreeData,
                showSearch: true,
                treeNodeFilterProp: 'title',
              }}
            />
            <ProFormSelect
              name="status"
              label="Status"
              options={PRODUCT_STATUS_OPTIONS}
              placeholder="All statuses"
            />
            <ProFormSelect
              name="type"
              label="Type"
              options={PRODUCT_TYPE_OPTIONS}
              placeholder="All types"
            />
            <ProFormSelect
              name="is_featured"
              label="Featured"
              options={FEATURED_OPTIONS}
              placeholder="Any"
            />
          </QueryFilter>
        </Card>
        <ProTable<ApiProduct, ProductQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          search={false}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
          }}
          toolBarRender={() => [
            <Button
              key="activate"
              icon={<CheckCircleOutlined />}
              disabled={!selectedKeys.length}
              onClick={() => batchUpdateStatus('active')}
            >
              Activate
            </Button>,
            <Button
              key="discontinue"
              disabled={!selectedKeys.length}
              onClick={() => batchUpdateStatus('discontinued')}
            >
              Discontinue
            </Button>,
            <span key="count" className="list-toolbar-count">
              {selectedKeys.length} selected
            </span>,
          ]}
          headerTitle={false}
          scroll={{ x: 1020 }}
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
                    ? 'No products match these filters.'
                    : 'No products in the catalog yet.'
                }
              >
                {hasFilters ? (
                  <Button onClick={resetFilters}>Reset filters</Button>
                ) : (
                  <Button type="primary" onClick={() => openEditor()}>
                    New product
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </div>

      {formOpen && (
        <ProductForm
          key={editing?.id ?? 'new'}
          product={editing}
          categoryTree={categoryTree}
          tagOptions={tagOptions}
          onClose={() => setFormOpen(false)}
          onSaved={reload}
        />
      )}

      <Drawer
        title={detail?.name ?? 'Product details'}
        width={640}
        open={detailLoading || !!detail}
        loading={detailLoading}
        onClose={() => setDetail(undefined)}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" title="Overview">
              <ProDescriptions<ApiProductDetail>
                column={1}
                dataSource={detail}
                columns={[
                  { title: 'SKU', dataIndex: 'sku' },
                  { title: 'Slug', dataIndex: 'slug' },
                  {
                    title: 'Status',
                    render: (_, product) => {
                      const meta = PRODUCT_STATUS_META[product.status];
                      return (
                        <span className={`status-pill status-pill--${meta.tone}`}>
                          {meta.label}
                        </span>
                      );
                    },
                  },
                  { title: 'Type', render: (_, product) => PRODUCT_TYPE_LABEL[product.type] },
                  { title: 'Short description', dataIndex: 'short_description' },
                  { title: 'Description', dataIndex: 'description' },
                  {
                    title: 'Categories',
                    render: (_, product) =>
                      product.categories.map((category) => category.name).join(', ') || '—',
                  },
                  {
                    title: 'Tags',
                    render: (_, product) => product.tags.map((tag) => tag.name).join(', ') || '—',
                  },
                ]}
              />
            </Card>
            <Card
              size="small"
              title="Images"
              extra={
                <Button size="small" icon={<PictureOutlined />} onClick={() => void openImages()}>
                  Manage
                </Button>
              }
            >
              {detail.images.length ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {detail.images.map((image) => (
                      <Space key={image.id} direction="vertical" size={2} align="center">
                        <Image
                          width={104}
                          height={104}
                          src={mediaUrl(image.url)}
                          style={{ objectFit: 'cover' }}
                        />
                        <Button
                          size="small"
                          type={image.featured ? 'primary' : 'text'}
                          icon={image.featured ? <StarFilled /> : <StarOutlined />}
                          aria-label={image.featured ? 'Featured image' : 'Set as featured'}
                          onClick={() => void featureImage(image.id)}
                        >
                          {image.featured ? 'Featured' : 'Set featured'}
                        </Button>
                      </Space>
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <Typography.Text type="secondary">
                  No images attached. Use Manage to attach files from the media library.
                </Typography.Text>
              )}
            </Card>
            <Card
              size="small"
              title="Price tiers"
              extra={
                <Button size="small" icon={<PlusOutlined />} onClick={() => setTierModalOpen(true)}>
                  Add tier
                </Button>
              }
            >
              <Table<PriceTier>
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={tiers}
                locale={{ emptyText: 'No price tiers yet.' }}
                columns={[
                  { title: 'MOQ', dataIndex: 'min_quantity', width: 90 },
                  {
                    title: 'Unit price',
                    dataIndex: 'unit_price',
                    render: (_, tier) => formatMoney(tier.unit_price, tier.currency),
                  },
                  { title: 'Label', dataIndex: 'label', render: (_, tier) => tier.label || '—' },
                  {
                    title: '',
                    width: 70,
                    render: (_, tier) => (
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label="Delete tier"
                        onClick={() =>
                          void (async () => {
                            await deletePriceTier(detail.id, tier.id);
                            await refreshTiers(detail.id);
                            void message.success('Price tier removed');
                          })()
                        }
                      />
                    ),
                  },
                ]}
              />
            </Card>
            <Card size="small" title="Variants">
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={detail.variants}
                locale={{ emptyText: 'No variants.' }}
                columns={[
                  { title: 'SKU', dataIndex: 'sku' },
                  { title: 'Name', dataIndex: 'name', render: (_, variant) => variant.name || '—' },
                  { title: 'Status', dataIndex: 'status' },
                ]}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      <Modal
        title="Add price tier"
        open={tierModalOpen}
        okText="Add tier"
        onCancel={() => {
          setTierModalOpen(false);
          tierForm.resetFields();
        }}
        onOk={() =>
          void (async () => {
            if (!detail) return;
            try {
              const values = await tierForm.validateFields();
              await addPriceTier(detail.id, values);
              await refreshTiers(detail.id);
              setTierModalOpen(false);
              tierForm.resetFields();
              void message.success('Price tier added');
            } catch {
              void message.error('Unable to add price tier');
            }
          })()
        }
      >
        <Form form={tierForm} layout="vertical">
          <Form.Item
            name="min_quantity"
            label="Minimum quantity"
            rules={[{ required: true, message: 'Enter the MOQ' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="unit_price"
            label="Unit price (USD)"
            rules={[{ required: true, message: 'Enter the unit price' }]}
          >
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="label" label="Label">
            <Input placeholder="e.g. Pallet pricing" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Product images"
        open={imageModalOpen}
        okText="Save images"
        confirmLoading={imageSaving}
        onCancel={() => setImageModalOpen(false)}
        onOk={() => void saveImages()}
      >
        <Typography.Paragraph type="secondary">
          Selection replaces the images attached to this product. Upload new files from the Media
          page first.
        </Typography.Paragraph>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Choose images"
          value={imageSelection}
          onChange={setImageSelection}
          optionFilterProp="label"
          options={imageOptions.map((media) => ({
            value: media.id,
            label: media.filename,
          }))}
        />
      </Modal>
    </PageContainer>
  );
}
