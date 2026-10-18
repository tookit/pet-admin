import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InboxOutlined,
  PictureOutlined,
  PlusOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
  QueryFilter,
  DrawerForm,
} from '@ant-design/pro-components';
import {
  App,
  Avatar,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  addPriceTier,
  createProduct,
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
import { flattenCategories, getCategoryTree } from '@/api/modules/category.api';
import { getTagList } from '@/api/modules/tag.api';
import {
  getMediaList,
  mediaUrl,
  setProductFeaturedImage,
  syncEntityMedia,
} from '@/api/modules/media.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import MetricsRow from '@/components/MetricsRow';
import type {
  ApiMedia,
  ApiProduct,
  ApiProductDetail,
  PriceTier,
  ProductCreateParams,
  ProductQueryParams,
  ProductStatus,
  ProductType,
} from '@/types/api';
import {
  FEATURED_OPTIONS,
  PRODUCT_STATUS_META,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
} from './options';

interface ProductFormValues {
  sku: string;
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  status: ProductStatus;
  type: ProductType;
  is_featured: boolean;
  category_ids: number[];
  tags: string[];
}

const DEFAULT_PRODUCT: ProductFormValues = {
  sku: '',
  name: '',
  slug: '',
  short_description: '',
  description: '',
  status: 'draft',
  type: 'physical',
  is_featured: false,
  category_ids: [],
  tags: [],
};

const EMPTY_STATS: ProductStats = { total: 0, active: 0, draft: 0, archived: 0 };

const formatMoney = (value: number | null | undefined, currency = 'USD') =>
  value == null ? '—' : `${currency} ${Number(value).toFixed(2)}`;

export default function ProductList() {
  const [form] = Form.useForm<ProductFormValues>();
  const [tierForm] = Form.useForm<{ min_quantity: number; unit_price: number; label?: string }>();
  const [editing, setEditing] = useState<ApiProduct>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<ApiProductDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageOptions, setImageOptions] = useState<ApiMedia[]>([]);
  const [imageSelection, setImageSelection] = useState<number[]>([]);
  const [imageSaving, setImageSaving] = useState(false);
  const [stats, setStats] = useState<ProductStats>(EMPTY_STATS);
  const [params, setParams] = useState<ProductQueryParams>({});
  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: number; label: string }>>(
    [],
  );
  const [tagOptions, setTagOptions] = useState<Array<{ value: string; label: string }>>([]);
  const { message } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiProduct, ProductQueryParams>({
    fetchData: getProductList,
    headerTitle: 'Products',
  });

  const loadOptions = useCallback(async () => {
    const [tree, tags] = await Promise.all([getCategoryTree(true), getTagList({ per_page: 100 })]);
    return {
      categories: flattenCategories(tree),
      tags: tags.result.map((tag) => ({ value: tag.name, label: tag.name })),
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadOptions()
      .then((options) => {
        if (!active) return;
        setCategoryOptions(options.categories);
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
    try {
      setStats(await getProductStats());
    } catch {
      void message.error('Unable to load product summary');
    }
    await actionRef.current?.reload();
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

  const openEditor = (product?: ApiProduct) => {
    setEditing(product);
    form.resetFields();
    form.setFieldsValue(
      product
        ? {
            sku: product.sku,
            name: product.name,
            slug: product.slug ?? '',
            short_description: product.short_description ?? '',
            description: '',
            status: product.status,
            type: product.type,
            is_featured: product.is_featured,
            category_ids: product.categories.map((category) => category.id),
            tags: product.tags.map((tag) => tag.name),
          }
        : DEFAULT_PRODUCT,
    );
    setDrawerOpen(true);
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

  const columns: ProColumns<ApiProduct>[] = [
    {
      title: 'Product',
      dataIndex: 'name',
      width: 300,
      render: (_: unknown, product: ApiProduct) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            src={mediaUrl(product.featured_image)}
            icon={<InboxOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Space size={4}>
              <a onClick={() => void openDetail(product)}>{product.name}</a>
              {product.is_featured && <StarFilled style={{ color: 'var(--app-warning)' }} />}
            </Space>
            <Typography.Text type="secondary">{product.sku}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_: unknown, product: ApiProduct) => (
        <Tag color={PRODUCT_STATUS_META[product.status].color}>
          {PRODUCT_STATUS_META[product.status].label}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      render: (_: unknown, product: ApiProduct) => PRODUCT_TYPE_LABEL[product.type],
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      width: 200,
      render: (_: unknown, product: ApiProduct) =>
        product.categories.length ? (
          <Space size={4} wrap>
            {product.categories.map((category) => (
              <Tag key={category.id}>{category.name}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'From',
      dataIndex: 'min_price',
      width: 130,
      render: (_: unknown, product: ApiProduct) => formatMoney(product.min_price),
    },
    { title: 'MOQ', dataIndex: 'moq', width: 80 },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      width: 130,
      responsive: ['lg' as const],
      render: (_: unknown, product: ApiProduct) =>
        product.created_at ? product.created_at.slice(0, 10) : '—',
    },
    {
      title: 'Actions',
      valueType: 'option' as const,
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, product: ApiProduct) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            aria-label={`View ${product.name}`}
            onClick={() => void openDetail(product)}
          />
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${product.name}`}
            onClick={() => openEditor(product)}
          />
          <Button
            size="small"
            type="text"
            icon={<CopyOutlined />}
            aria-label={`Duplicate ${product.name}`}
            onClick={() =>
              void perform(() => duplicateProduct(product.id).then(() => {}), 'Product duplicated')
            }
          />
          <Popconfirm
            title={`Delete ${product.name}?`}
            description="This soft-deletes the product in pet-api."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              void perform(() => deleteProduct(product.id), 'Product deleted');
            }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${product.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Products"
      subTitle="Manage the wholesale catalog stored in pet-api."
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
          New Product
        </Button>
      }
    >
      <div className="section-stack">
        <MetricsRow
          items={[
            {
              label: 'Total Products',
              value: stats.total,
              icon: <AppstoreOutlined />,
              detail: 'Across every category',
            },
            {
              label: 'Active',
              value: stats.active,
              icon: <CheckCircleOutlined />,
              tone: 'success',
              trend: {
                text: `${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%`,
                caption: 'of total products',
              },
            },
            {
              label: 'Draft',
              value: stats.draft,
              icon: <FileTextOutlined />,
              tone: 'warning',
              detail: 'Not published yet',
            },
            {
              label: 'Archived',
              value: stats.archived,
              icon: <StarOutlined />,
              tone: 'error',
              detail: 'Retired from the catalog',
            },
          ]}
        />
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<ProductQueryParams>
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
            <ProFormText name="search" label="Search" placeholder="Name or SKU" />
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
              name="category_id"
              label="Category"
              options={categoryOptions}
              placeholder="All categories"
              showSearch
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
          headerTitle={`${stats.total} products in total`}
          scroll={{ x: 1100 }}
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
              <Empty description="No products match this view.">
                <Button onClick={() => openEditor()}>New Product</Button>
              </Empty>
            ),
          }}
        />
      </div>

      <DrawerForm<ProductFormValues>
        title={editing ? 'Edit Product' : 'New Product'}
        width={640}
        form={form}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialValues={DEFAULT_PRODUCT}
        submitter={{
          searchConfig: {
            submitText: editing ? 'Save Changes' : 'Create Product',
            resetText: 'Cancel',
          },
        }}
        onFinish={async (values) => {
          const payload: ProductCreateParams = {
            sku: values.sku,
            name: values.name,
            slug: values.slug || null,
            short_description: values.short_description || null,
            description: values.description || null,
            status: values.status,
            type: values.type,
            is_featured: values.is_featured,
            category_ids: values.category_ids ?? [],
            tags: values.tags ?? [],
          };
          try {
            if (editing) {
              await updateProduct(editing.id, payload);
            } else {
              await createProduct(payload);
            }
            await reload();
            void message.success(editing ? 'Product updated' : 'Product created');
            return true;
          } catch {
            void message.error(
              editing
                ? 'Unable to update product'
                : 'Unable to create product. Check the SKU and slug.',
            );
            return false;
          }
        }}
      >
        <ProFormText name="sku" label="SKU" rules={[{ required: true, whitespace: true }]} />
        <ProFormText name="name" label="Name" rules={[{ required: true, whitespace: true }]} />
        <ProFormText
          name="slug"
          label="Slug"
          placeholder="Generated from the name when left empty"
          rules={[{ pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Use lowercase kebab-case' }]}
        />
        <ProFormTextArea
          name="short_description"
          label="Short description"
          fieldProps={{ maxLength: 500, showCount: true }}
        />
        <ProFormTextArea name="description" label="Description" fieldProps={{ rows: 5 }} />
        <Space size={16} style={{ display: 'flex' }} align="start">
          <ProFormSelect name="status" label="Status" options={PRODUCT_STATUS_OPTIONS} />
          <ProFormSelect name="type" label="Type" options={PRODUCT_TYPE_OPTIONS} />
          <ProFormSwitch name="is_featured" label="Featured" />
        </Space>
        <ProFormSelect
          name="category_ids"
          label="Categories"
          mode="multiple"
          options={categoryOptions}
          showSearch
          placeholder="Assign one or more categories"
        />
        <ProFormSelect
          name="tags"
          label="Tags"
          mode="tags"
          options={tagOptions}
          placeholder="Type a tag and press Enter"
        />
      </DrawerForm>

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
                    render: (_, product) => PRODUCT_STATUS_META[product.status].label,
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
