import {
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  Alert,
  App,
  Button,
  Checkbox,
  Col,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  TreeSelect,
  Typography,
  Upload,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/api/client';
import {
  addPriceTier,
  createProduct,
  deletePriceTier,
  deleteProduct,
  getProduct,
  getProductList,
  updateProduct,
} from '@/api/modules/product.api';
import {
  detachEntityMedia,
  getMediaDirectories,
  getMediaList,
  mediaUrl,
  setProductFeaturedImage,
  syncEntityMedia,
  uploadMedia,
} from '@/api/modules/media.api';
import type { CategoryTree } from '@/types/api';
import type {
  ApiMedia,
  ApiProduct,
  MediaDirectory,
  ApiProductDetail,
  PriceTier,
  ProductCreateParams,
  ProductStatus,
  ProductType,
} from '@/types/api';
import { PRODUCT_STATUS_OPTIONS, PRODUCT_TYPE_OPTIONS } from './options';

interface ProductFormValues {
  sku: string;
  name: string;
  slug?: string;
  short_description?: string;
  status: ProductStatus;
  type: ProductType;
  is_featured: boolean;
  category_ids: number[];
  tags: string[];
}

interface TierDraft {
  key: string;
  id?: number;
  min_quantity: number | null;
  unit_price: number | null;
  currency: string;
  label: string;
}

interface FormImage {
  id: number;
  url: string;
  filename?: string;
  size?: number;
}

interface ProductFormProps {
  product?: ApiProduct;
  categoryTree: CategoryTree[];
  tagOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const DEFAULT_VALUES: ProductFormValues = {
  sku: '',
  name: '',
  slug: '',
  short_description: '',
  status: 'draft',
  type: 'physical',
  is_featured: false,
  category_ids: [],
  tags: [],
};

const CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP'].map((value) => ({ value, label: value }));
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const tierKey = () => `tier-${Math.random().toString(36).slice(2, 9)}`;

interface CategoryTreeNode {
  title: string;
  value: number;
  key: number;
  children?: CategoryTreeNode[];
}

const toTreeData = (nodes: CategoryTree[]): CategoryTreeNode[] =>
  nodes.map((node) => ({
    title: node.name,
    value: node.id,
    key: node.id,
    children: node.children.length ? toTreeData(node.children) : undefined,
  }));

const toTierDraft = (tier: PriceTier): TierDraft => ({
  key: `tier-${tier.id}`,
  id: tier.id,
  min_quantity: tier.min_quantity,
  unit_price: Number(tier.unit_price),
  currency: tier.currency,
  label: tier.label ?? '',
});

const errorText = (error: unknown, fallback: string) =>
  error instanceof ApiError && error.message ? error.message : fallback;

const isCompleteTier = (tier: TierDraft) =>
  tier.min_quantity != null &&
  tier.min_quantity >= 1 &&
  tier.unit_price != null &&
  tier.unit_price > 0;

export default function ProductForm({
  product,
  categoryTree,
  tagOptions,
  onClose,
  onSaved,
}: ProductFormProps) {
  const [form] = Form.useForm<ProductFormValues>();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(Boolean(product));
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [tiers, setTiers] = useState<TierDraft[]>([]);
  const [originalTiers, setOriginalTiers] = useState<PriceTier[]>([]);
  const [editingTier, setEditingTier] = useState<string>();
  const [tierBackup, setTierBackup] = useState<TierDraft>();
  const [duplicateTiers, setDuplicateTiers] = useState<string[]>([]);
  const [images, setImages] = useState<FormImage[]>([]);
  const [originalImages, setOriginalImages] = useState<FormImage[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<number>();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryImages, setLibraryImages] = useState<ApiMedia[]>([]);
  const [librarySelection, setLibrarySelection] = useState<FormImage[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryPage, setLibraryPage] = useState(1);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFolder, setLibraryFolder] = useState<string>();
  const [libraryFolders, setLibraryFolders] = useState<MediaDirectory[]>([]);
  const createdId = useRef<number | undefined>(undefined);

  const treeData = useMemo(() => toTreeData(categoryTree), [categoryTree]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    getProduct(product.id)
      .then((detail: ApiProductDetail) => {
        if (!active) return;
        form.setFieldsValue({
          sku: detail.sku,
          name: detail.name,
          slug: detail.slug ?? '',
          short_description: detail.short_description ?? '',
          status: detail.status,
          type: detail.type,
          is_featured: detail.is_featured,
          category_ids: detail.categories.map((category) => category.id),
          tags: detail.tags.map((tag) => tag.name),
        });
        setTiers(detail.tiers.map(toTierDraft));
        setOriginalTiers(detail.tiers);
        const nextImages = detail.images.map((image) => ({ id: image.id, url: image.url }));
        setImages(nextImages);
        setOriginalImages(nextImages);
        setFeaturedImageId(detail.images.find((image) => image.featured)?.id);
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form, product]);

  const reloadDetail = useCallback(() => {
    if (!product) return;
    setLoading(true);
    setLoadError(false);
    getProduct(product.id)
      .then((detail) => {
        form.setFieldsValue({
          sku: detail.sku,
          name: detail.name,
          slug: detail.slug ?? '',
          short_description: detail.short_description ?? '',
          status: detail.status,
          type: detail.type,
          is_featured: detail.is_featured,
          category_ids: detail.categories.map((category) => category.id),
          tags: detail.tags.map((tag) => tag.name),
        });
        setTiers(detail.tiers.map(toTierDraft));
        setOriginalTiers(detail.tiers);
        const nextImages = detail.images.map((image) => ({ id: image.id, url: image.url }));
        setImages(nextImages);
        setOriginalImages(nextImages);
        setFeaturedImageId(detail.images.find((image) => image.featured)?.id);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [form, product]);

  const updateTier = (key: string, patch: Partial<TierDraft>) => {
    setDuplicateTiers([]);
    setTiers((current) => current.map((tier) => (tier.key === key ? { ...tier, ...patch } : tier)));
  };

  const startEditingTier = (tier: TierDraft) => {
    setEditingTier(tier.key);
    setTierBackup({ ...tier });
  };

  const cancelEditingTier = () => {
    if (editingTier && tierBackup) {
      setTiers((current) => current.map((tier) => (tier.key === editingTier ? tierBackup : tier)));
    }
    setEditingTier(undefined);
    setTierBackup(undefined);
  };

  const finishEditingTier = (tier: TierDraft) => {
    if (!isCompleteTier(tier)) {
      void message.error('Enter an MOQ of at least 1 and a unit price above 0.');
      return;
    }
    setEditingTier(undefined);
    setTierBackup(undefined);
  };

  const addTier = () => {
    const ordered = [...tiers].sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0));
    const last = ordered[ordered.length - 1];
    const draft: TierDraft = {
      key: tierKey(),
      min_quantity: last?.min_quantity != null ? last.min_quantity + 100 : 100,
      unit_price: last?.unit_price ?? null,
      currency: last?.currency ?? 'USD',
      label: '',
    };
    setTiers((current) => [...current, draft]);
    setEditingTier(draft.key);
    setTierBackup({ ...draft });
  };

  const removeTier = (tier: TierDraft) => {
    const remove = () => {
      setTiers((current) => current.filter((item) => item.key !== tier.key));
      if (editingTier === tier.key) {
        setEditingTier(undefined);
        setTierBackup(undefined);
      }
    };
    if (tiers.length === 1) {
      void modal.confirm({
        title: 'Remove the last price tier?',
        content: 'At least one price tier is required before the product can be saved.',
        okText: 'Remove',
        okButtonProps: { danger: true },
        onOk: remove,
      });
      return;
    }
    remove();
  };

  const validateTiers = (): TierDraft[] | null => {
    if (!tiers.length) {
      void message.error('Add at least one price tier.');
      return null;
    }
    if (tiers.some((tier) => !isCompleteTier(tier))) {
      void message.error('Every tier needs an MOQ of at least 1 and a unit price above 0.');
      return null;
    }
    const counts = new Map<number, string[]>();
    tiers.forEach((tier) => {
      if (tier.min_quantity == null) return;
      counts.set(tier.min_quantity, [...(counts.get(tier.min_quantity) ?? []), tier.key]);
    });
    const duplicates = [...counts.values()].filter((keys) => keys.length > 1).flat();
    setDuplicateTiers(duplicates);
    if (duplicates.length) {
      void message.error('Each minimum order quantity can appear only once.');
      return null;
    }
    return [...tiers].sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0));
  };

  const persistTiers = async (productId: number, next: TierDraft[]) => {
    const draftsById = new Map(next.filter((tier) => tier.id).map((tier) => [tier.id, tier]));

    // pet-api has no tier update endpoint: create the replacement first, then
    // remove the old row so a failed create does not drop the price.
    for (const existing of originalTiers) {
      const draft = draftsById.get(existing.id);
      if (!draft) {
        await deletePriceTier(productId, existing.id);
        continue;
      }
      const changed =
        draft.min_quantity !== existing.min_quantity ||
        Number(draft.unit_price) !== Number(existing.unit_price) ||
        draft.currency !== existing.currency ||
        draft.label !== (existing.label ?? '');
      if (changed) {
        await addPriceTier(productId, {
          min_quantity: draft.min_quantity ?? 1,
          unit_price: draft.unit_price ?? 0,
          currency: draft.currency,
          label: draft.label || null,
        });
        await deletePriceTier(productId, existing.id);
      }
      draftsById.delete(existing.id);
    }

    for (const draft of next) {
      if (draft.id && draftsById.has(draft.id)) {
        continue;
      }
      if (!draft.id) {
        await addPriceTier(productId, {
          min_quantity: draft.min_quantity ?? 1,
          unit_price: draft.unit_price ?? 0,
          currency: draft.currency,
          label: draft.label || null,
        });
      }
    }
  };

  const persistMedia = async (productId: number) => {
    if (images.length) {
      await syncEntityMedia(
        'Product',
        productId,
        images.map((image) => image.id),
      );
    } else if (product) {
      for (const image of originalImages) {
        await detachEntityMedia('Product', productId, image.id);
      }
    }
    if (images.length && featuredImageId) {
      await setProductFeaturedImage(productId, featuredImageId);
    }
  };

  const submit = async (values: ProductFormValues) => {
    const sortedTiers = validateTiers();
    if (!sortedTiers) return;

    const sku = values.sku.trim();
    setSaving(true);
    try {
      if (!product || sku.toLowerCase() !== product.sku.toLowerCase()) {
        const existing = await getProductList({ search: sku, pageSize: 20 });
        if (
          existing.result.some(
            (item) =>
              item.sku.toLowerCase() === sku.toLowerCase() &&
              item.id !== product?.id &&
              item.id !== createdId.current,
          )
        ) {
          form.setFields([{ name: 'sku', errors: ['This SKU already exists'] }]);
          return;
        }
      }

      const payload: ProductCreateParams = {
        sku,
        name: values.name.trim(),
        slug: values.slug?.trim() || (product ? product.slug : null),
        short_description: values.short_description?.trim() || null,
        status: values.status,
        type: values.type,
        is_featured: values.is_featured,
        category_ids: values.category_ids ?? [],
        tags: values.tags ?? [],
      };

      let productId: number;
      if (product) {
        await updateProduct(product.id, payload);
        productId = product.id;
      } else if (createdId.current) {
        await updateProduct(createdId.current, payload);
        productId = createdId.current;
      } else {
        productId = (await createProduct(payload)).id;
        createdId.current = productId;
      }

      await persistTiers(productId, sortedTiers);
      await persistMedia(productId);
      await onSaved();
      void message.success(product ? 'Product updated' : 'Product created');
      onClose();
    } catch (error) {
      void message.error(
        errorText(
          error,
          product
            ? 'Unable to update the product. Please try again.'
            : 'Unable to create the product. Check the SKU and slug.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!product) return;
    void modal.confirm({
      title: `Delete ${product.name}?`,
      content: 'This soft-deletes the product in pet-api.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteProduct(product.id);
          await onSaved();
          void message.success('Product deleted');
          onClose();
        } catch (error) {
          void message.error(errorText(error, 'Unable to delete the product.'));
        }
      },
    });
  };

  const LIBRARY_PAGE_SIZE = 24;

  const loadLibrary = async (page = 1, folder?: string, search = '') => {
    setLibraryLoading(true);
    try {
      const response = await getMediaList({
        aggregate_type: 'image',
        current: page,
        pageSize: LIBRARY_PAGE_SIZE,
        directory: folder,
        filename: search.trim() || undefined,
      });
      setLibraryImages(response.result);
      setLibraryTotal(response.total);
      setLibraryPage(page);
    } catch {
      void message.error('Unable to load the media library');
    } finally {
      setLibraryLoading(false);
    }
  };

  const openLibrary = () => {
    setLibrarySelection(images);
    setLibrarySearch('');
    setLibraryFolder(undefined);
    setLibraryOpen(true);
    void loadLibrary(1, undefined, '');
    if (!libraryFolders.length) {
      getMediaDirectories('image')
        .then(setLibraryFolders)
        .catch(() => setLibraryFolders([]));
    }
  };

  const chooseLibraryFolder = (folder?: string) => {
    setLibraryFolder(folder);
    void loadLibrary(1, folder, librarySearch);
  };

  const searchLibrary = (value: string) => {
    setLibrarySearch(value);
    void loadLibrary(1, libraryFolder, value);
  };

  const applyLibrarySelection = () => {
    setImages(librarySelection);
    if (!librarySelection.some((image) => image.id === featuredImageId)) {
      setFeaturedImageId(librarySelection[0]?.id);
    }
    setLibraryOpen(false);
  };

  const handleUpload = async (file: File) => {
    const total = images.reduce((sum, image) => sum + (image.size ?? 0), 0);
    if (!IMAGE_TYPES.includes(file.type)) {
      void message.error('Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      void message.error(`${file.name} is larger than 10 MB.`);
      return;
    }
    if (total + file.size > MAX_TOTAL_SIZE) {
      void message.error('Product images cannot exceed 50 MB in total.');
      return;
    }
    setUploading((count) => count + 1);
    try {
      const response = await uploadMedia(file);
      const image: FormImage = {
        id: response.media.id,
        url: response.media.url,
        filename: response.media.filename,
        size: response.media.size,
      };
      setImages((current) => [...current, image]);
      setFeaturedImageId((current) => current ?? image.id);
      void message.success(`${file.name} uploaded`);
    } catch (error) {
      void message.error(errorText(error, `Unable to upload ${file.name}.`));
      throw error;
    } finally {
      setUploading((count) => count - 1);
    }
  };

  const beforeUpload = (file: File) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      void message.error('Use a JPG, PNG or WebP image.');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE) {
      void message.error(`${file.name} is larger than 10 MB.`);
      return Upload.LIST_IGNORE;
    }
    const total = images.reduce((sum, image) => sum + (image.size ?? 0), 0);
    if (total + file.size > MAX_TOTAL_SIZE) {
      void message.error('Product images cannot exceed 50 MB in total.');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const removeImage = (image: FormImage) => {
    setImages((current) => current.filter((item) => item.id !== image.id));
    if (featuredImageId === image.id) {
      setFeaturedImageId(undefined);
    }
  };

  const tierColumns: ColumnsType<TierDraft> = [
    {
      title: 'Min. order qty',
      dataIndex: 'min_quantity',
      width: 120,
      render: (_, tier) =>
        editingTier === tier.key ? (
          <InputNumber
            min={1}
            precision={0}
            value={tier.min_quantity}
            onChange={(value) => updateTier(tier.key, { min_quantity: value })}
            style={{ width: '100%' }}
            aria-label="Minimum order quantity"
          />
        ) : (
          <span className="tabular-nums">
            {tier.min_quantity != null ? tier.min_quantity.toLocaleString() : '—'}
          </span>
        ),
    },
    {
      title: 'Unit price',
      dataIndex: 'unit_price',
      width: 110,
      align: 'right',
      render: (_, tier) =>
        editingTier === tier.key ? (
          <InputNumber
            min={0.01}
            step={0.01}
            precision={2}
            value={tier.unit_price}
            onChange={(value) => updateTier(tier.key, { unit_price: value })}
            style={{ width: '100%' }}
            aria-label="Unit price"
          />
        ) : (
          <span className="tabular-nums">
            {tier.unit_price != null ? tier.unit_price.toFixed(2) : '—'}
          </span>
        ),
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      width: 95,
      render: (_, tier) =>
        editingTier === tier.key ? (
          <Select
            value={tier.currency}
            options={CURRENCIES}
            onChange={(value) => updateTier(tier.key, { currency: value })}
            aria-label="Currency"
          />
        ) : (
          tier.currency
        ),
    },
    {
      title: 'Label',
      dataIndex: 'label',
      width: 150,
      render: (_, tier) =>
        editingTier === tier.key ? (
          <Input
            value={tier.label}
            placeholder="e.g. Wholesale"
            onChange={(event) => updateTier(tier.key, { label: event.target.value })}
            aria-label="Tier label"
          />
        ) : (
          tier.label || '—'
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 116,
      render: (_, tier) =>
        editingTier === tier.key ? (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => finishEditingTier(tier)}>
              Save
            </Button>
            <Button type="link" size="small" onClick={cancelEditingTier}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              onClick={() => startEditingTier(tier)}
              disabled={Boolean(editingTier)}
            >
              Edit
            </Button>
            <Button type="link" size="small" danger onClick={() => removeTier(tier)}>
              Delete
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <Drawer
      open
      width={640}
      title={product ? `Edit product · ${product.name}` : 'New product'}
      onClose={onClose}
      rootClassName="product-form"
      footer={
        <div className="product-form-footer">
          {product ? (
            <Button type="text" danger icon={<DeleteOutlined />} onClick={confirmDelete}>
              Delete product
            </Button>
          ) : (
            <span />
          )}
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={saving}
              disabled={loading || loadError || uploading > 0}
              onClick={() => form.submit()}
            >
              {product ? 'Save changes' : 'Create product'}
            </Button>
          </Space>
        </div>
      }
    >
      {loadError ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load this product."
          description="The form could not be filled from pet-api."
          action={
            <Button size="small" onClick={reloadDetail}>
              Retry
            </Button>
          }
        />
      ) : loading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <Form<ProductFormValues>
          form={form}
          layout="vertical"
          requiredMark
          initialValues={DEFAULT_VALUES}
          onFinish={(values) => void submit(values)}
        >
          <section className="product-form-section">
            <Typography.Title level={5} className="product-form-section__title">
              Basic information
            </Typography.Title>
            <Typography.Text className="product-form-section__hint">
              SKU and name are required; leave the slug empty to generate it from the name.
            </Typography.Text>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="sku"
                  label="SKU"
                  rules={[{ required: true, whitespace: true, message: 'Enter a unique SKU' }]}
                >
                  <Input className="mono" placeholder="AQ-HT-300W-01" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Product name"
                  rules={[
                    { required: true, whitespace: true, message: 'Enter the product name' },
                    { min: 2, max: 120, message: 'Use 2–120 characters' },
                  ]}
                >
                  <Input placeholder="Smart aquarium heater 300W" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[
                    {
                      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Use lowercase letters, numbers and hyphens',
                    },
                  ]}
                >
                  <Input placeholder="aquarium-heater-300w" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="type" label="Type">
                  <Select options={PRODUCT_TYPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="short_description" label="Short description">
                  <Input.TextArea
                    rows={3}
                    maxLength={500}
                    showCount
                    placeholder="A short summary shown on the product card."
                  />
                </Form.Item>
              </Col>
            </Row>
          </section>

          <section className="product-form-section">
            <Typography.Title level={5} className="product-form-section__title">
              Categories & tags
            </Typography.Title>
            <Typography.Text className="product-form-section__hint">
              Categories are multi-select and drive storefront filtering; tags support search and
              OEM labels.
            </Typography.Text>
            <Form.Item name="category_ids" label="Categories">
              <TreeSelect
                treeData={treeData}
                treeCheckable
                showSearch
                treeNodeFilterProp="title"
                placeholder="Choose one or more categories"
                maxTagCount="responsive"
                allowClear
              />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                tokenSeparators={[',']}
                options={tagOptions}
                placeholder="Type a tag and press Enter"
                suffixIcon={null}
              />
            </Form.Item>
          </section>

          <section className="product-form-section">
            <Typography.Title level={5} className="product-form-section__title">
              Pricing & MOQ
            </Typography.Title>
            <Typography.Text className="product-form-section__hint">
              Tiers are sorted by quantity; the lowest MOQ becomes the product MOQ and buyers
              automatically match a tier by quantity.
            </Typography.Text>
            <Table<TierDraft>
              size="small"
              rowKey="key"
              columns={tierColumns}
              dataSource={tiers}
              pagination={false}
              scroll={{ x: 560 }}
              rowClassName={(tier) =>
                duplicateTiers.includes(tier.key) ? 'product-tier-row--duplicate' : ''
              }
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Add the first wholesale price tier."
                  />
                ),
              }}
            />
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={addTier}
              disabled={Boolean(editingTier)}
              className="product-tier-add"
            >
              Add tier
            </Button>
          </section>

          <section className="product-form-section">
            <Typography.Title level={5} className="product-form-section__title">
              Media
            </Typography.Title>
            <Typography.Text className="product-form-section__hint">
              Drag or click to upload, or pick from the media library. The first image is used as
              the main image unless you star another.
            </Typography.Text>
            <Upload.Dragger
              multiple
              accept="image/jpeg,image/png,image/webp"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={({ file, onSuccess, onError }) => {
                void handleUpload(file as File)
                  .then((response) => onSuccess?.(response))
                  .catch((error: Error) => onError?.(error));
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Drag files here, or click to upload</p>
              <p className="ant-upload-hint">
                JPG / PNG / WebP · up to 10 MB each · multiple allowed
              </p>
            </Upload.Dragger>
            <Button
              type="text"
              icon={<UploadOutlined />}
              onClick={openLibrary}
              className="product-library-trigger"
            >
              Choose from media library
            </Button>
            {images.length ? (
              <div className="product-media-grid">
                {images.map((image) => {
                  const featured = image.id === featuredImageId;
                  return (
                    <div className="product-media-card" key={image.id}>
                      <div className="product-media-card__frame">
                        <Image
                          src={mediaUrl(image.url)}
                          width={80}
                          height={80}
                          style={{ objectFit: 'cover' }}
                          preview={{ mask: false }}
                          alt={image.filename ?? 'Product image'}
                        />
                        {featured && <span className="product-media-card__badge">Main</span>}
                        <div className="product-media-card__overlay">
                          {!featured && (
                            <Button
                              type="text"
                              size="small"
                              aria-label="Set as main image"
                              icon={<StarOutlined />}
                              onClick={() => setFeaturedImageId(image.id)}
                            />
                          )}
                          <Button
                            type="text"
                            size="small"
                            danger
                            aria-label="Remove image"
                            icon={<DeleteOutlined />}
                            onClick={() => removeImage(image)}
                          />
                        </div>
                      </div>
                      {featured ? (
                        <span className="product-media-card__caption">
                          <StarFilled /> Main
                        </span>
                      ) : (
                        <Button
                          type="link"
                          size="small"
                          className="product-media-card__caption"
                          onClick={() => setFeaturedImageId(image.id)}
                        >
                          Set as main
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Typography.Text type="secondary" className="product-media-empty">
                No images attached yet.
              </Typography.Text>
            )}
          </section>

          <section className="product-form-section">
            <Typography.Title level={5} className="product-form-section__title">
              Publishing
            </Typography.Title>
            <Typography.Text className="product-form-section__hint">
              Drafts stay hidden; Active products enter the storefront catalog.
            </Typography.Text>
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12}>
                <Form.Item name="status" label="Status">
                  <Select options={PRODUCT_STATUS_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </section>
        </Form>
      )}

      <Modal
        title="Choose from media library"
        open={libraryOpen}
        width={720}
        okText="Use selected images"
        onOk={applyLibrarySelection}
        onCancel={() => setLibraryOpen(false)}
        destroyOnClose
      >
        <div className="product-library-toolbar">
          <Select
            placeholder="All folders"
            allowClear
            value={libraryFolder}
            onChange={chooseLibraryFolder}
            options={libraryFolders.map((folder) => ({
              value: folder.directory,
              label: `${folder.directory} (${folder.count})`,
            }))}
            style={{ minWidth: 180 }}
          />
          <Input.Search
            placeholder="Search filenames"
            allowClear
            onSearch={searchLibrary}
            style={{ flex: 1 }}
          />
        </div>
        {libraryLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : libraryImages.length ? (
          <div className="product-library-grid">
            {libraryImages.map((media) => {
              const selected = librarySelection.some((image) => image.id === media.id);
              return (
                <label
                  key={media.id}
                  className={`product-library-item${selected ? ' product-library-item--selected' : ''}`}
                >
                  <Checkbox
                    checked={selected}
                    onChange={(event) =>
                      setLibrarySelection((current) =>
                        event.target.checked
                          ? [
                              ...current,
                              {
                                id: media.id,
                                url: media.url,
                                filename: media.filename,
                                size: media.size,
                              },
                            ]
                          : current.filter((image) => image.id !== media.id),
                      )
                    }
                  />
                  <img src={mediaUrl(media.url)} alt={media.filename} />
                  <span className="product-library-item__name">{media.filename}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <Empty description="No images match this view." />
        )}
        {libraryTotal > LIBRARY_PAGE_SIZE && (
          <Pagination
            className="product-library-pagination"
            current={libraryPage}
            pageSize={LIBRARY_PAGE_SIZE}
            total={libraryTotal}
            showSizeChanger={false}
            onChange={(page) => void loadLibrary(page, libraryFolder, librarySearch)}
          />
        )}
      </Modal>
    </Drawer>
  );
}
