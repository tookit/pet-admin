import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import {
  App,
  Button,
  Col,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  createSupplier,
  deleteSupplier,
  getSupplierList,
  getSupplierProducts,
  updateSupplier,
} from '@/api/modules/supplier.api';
import { RowActions } from '@/components/RowActions';
import { useFilterQuery } from '@/hooks/useFilterQuery';
import { useProTable } from '@/hooks/useProTable';
import type {
  ApiSupplier,
  ApiSupplierProduct,
  SupplierCreateParams,
  SupplierQueryParams,
  SupplierStatus,
} from '@/types/api';

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'blacklisted', label: 'Blacklisted' },
];

const PLATFORM_OPTIONS = [
  { value: '1688', label: '1688' },
  { value: 'alibaba', label: 'Alibaba.com' },
  { value: 'offline', label: 'Offline / factory' },
  { value: 'other', label: 'Other' },
];

const STATUS_VALUE_ENUM = {
  prospect: { text: 'Prospect', status: 'Default' },
  active: { text: 'Active', status: 'Success' },
  on_hold: { text: 'On hold', status: 'Warning' },
  blacklisted: { text: 'Blacklisted', status: 'Error' },
} as const;

const decodeSupplierFilters = (search: URLSearchParams): SupplierQueryParams => ({
  name: search.get('name') ?? undefined,
  platform: search.get('platform') ?? undefined,
  status: (search.get('status') as SupplierStatus | null) ?? undefined,
  province: search.get('province') ?? undefined,
});

const rateText = (value: number | string | null) =>
  value == null ? '—' : `${Number(value).toFixed(1)}%`;

const location = (record: ApiSupplier) =>
  [record.province, record.city].filter(Boolean).join(' / ') || '—';

const contact = (record: ApiSupplier) =>
  [record.contact_name, record.phone ?? record.wechat].filter(Boolean).join(' · ') || '—';

const cny = (value: number | string | null) =>
  value == null ? '—' : `¥${Number(value).toFixed(2)}`;

export default function SupplierList() {
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm<SupplierCreateParams>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiSupplier>();
  const [saving, setSaving] = useState(false);
  const [productsFor, setProductsFor] = useState<ApiSupplier>();
  const [products, setProducts] = useState<ApiSupplierProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { message } = App.useApp();
  const {
    params,
    apply: applyFilters,
    clear: clearFilters,
    hasFilters,
  } = useFilterQuery<SupplierQueryParams>(filterForm, decodeSupplierFilters);

  const fetchSuppliers = useCallback(
    (query: SupplierQueryParams) => getSupplierList(query),
    [],
  );

  const { actionRef, defaultProTableProps } = useProTable<ApiSupplier, SupplierQueryParams>({
    fetchData: fetchSuppliers,
    headerTitle: 'Suppliers',
  });

  const openEditor = (record?: ApiSupplier) => {
    setEditing(record);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    if (editing) {
      editForm.setFieldsValue({ ...editing });
    } else {
      editForm.resetFields();
      editForm.setFieldsValue({ platform: '1688', status: 'prospect' });
    }
  }, [modalOpen, editing, editForm]);

  const closeEditor = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  const submit = async () => {
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      if (editing) {
        await updateSupplier(editing.id, values);
        void message.success('Supplier updated');
      } else {
        await createSupplier(values);
        void message.success('Supplier created');
      }
      closeEditor();
      await actionRef.current?.reload();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return; // validation
      void message.error('Unable to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: ApiSupplier) => {
    try {
      await deleteSupplier(record.id);
      await actionRef.current?.reload();
      void message.success('Supplier deleted');
    } catch {
      void message.error('Unable to delete supplier');
    }
  };

  const resetFilters = () => {
    clearFilters();
    actionRef.current?.setPageInfo?.({ current: 1 });
  };

  const openProducts = async (record: ApiSupplier) => {
    setProductsFor(record);
    setProducts([]);
    setProductsLoading(true);
    try {
      const data = await getSupplierProducts(record.id);
      setProducts(data.items ?? []);
    } catch {
      void message.error('Unable to load this supplier’s products');
    } finally {
      setProductsLoading(false);
    }
  };

  const columns: ProColumns<ApiSupplier>[] = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.shop_url ? (
              <a href={record.shop_url} target="_blank" rel="noreferrer">
                {record.name}
              </a>
            ) : (
              record.name
            )}
          </div>
          <div style={{ color: 'var(--color-text-secondary, #888)', fontSize: 12 }}>
            {record.main_category || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      search: false,
      width: 110,
    },
    {
      title: 'Location',
      dataIndex: 'province',
      search: false,
      render: (_, record) => location(record),
    },
    {
      title: 'Contact',
      dataIndex: 'contact_name',
      search: false,
      render: (_, record) => contact(record),
    },
    {
      title: 'Years',
      dataIndex: 'years_on_platform',
      search: false,
      width: 80,
      render: (_, record) => record.years_on_platform ?? '—',
    },
    {
      title: 'Repeat rate',
      dataIndex: 'repeat_rate',
      search: false,
      width: 110,
      render: (_, record) => rateText(record.repeat_rate),
    },
    {
      title: 'MOQ',
      dataIndex: 'min_order_qty',
      search: false,
      width: 90,
      render: (_, record) => record.min_order_qty ?? '—',
    },
    {
      title: 'Products',
      dataIndex: 'product_count',
      search: false,
      width: 110,
      render: (_, record) =>
        record.product_count ? (
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => void openProducts(record)}>
            {record.product_count} linked
          </Button>
        ) : (
          <span style={{ color: 'var(--color-text-tertiary, #999)' }}>—</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      search: false,
      width: 120,
      valueEnum: STATUS_VALUE_ENUM,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      search: false,
      width: 80,
      render: (_, record) => record.score ?? '—',
    },
    {
      title: 'Action',
      valueType: 'option',
      key: 'action',
      width: 64,
      render: (_, record) => (
        <RowActions
          label={`Actions for ${record.name}`}
          items={[
            { key: 'edit', label: 'Edit', onClick: () => openEditor(record) },
            {
              key: 'products',
              label: 'Products & ordering',
              icon: <ShoppingCartOutlined />,
              onClick: () => void openProducts(record),
            },
          ]}
          deleteTitle="Delete this supplier?"
          deleteContent="The supplier will be removed from the list."
          onDelete={() => remove(record)}
        />
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Suppliers',
        extra: [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New Supplier
          </Button>,
        ],
      }}
    >
      <div className="section-stack">
        <QueryFilter<SupplierQueryParams>
          form={filterForm}
          className="list-query"
          colon={false}
          defaultCollapsed={false}
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
          <ProFormText name="name" label="Name" placeholder="Search by name" />
          <ProFormSelect
            name="platform"
            label="Platform"
            options={PLATFORM_OPTIONS}
            placeholder="All platforms"
          />
          <ProFormSelect
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
          <ProFormText name="province" label="Province" placeholder="e.g. 广东" />
        </QueryFilter>

        <ProTable<ApiSupplier, SupplierQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          search={false}
          headerTitle={false}
          scroll={{ x: 1080 }}
          locale={{
            emptyText: (
              <Empty
                description={
                  hasFilters ? 'No suppliers match these filters.' : 'No suppliers yet.'
                }
              >
                {hasFilters ? (
                  <Button onClick={resetFilters}>Reset filters</Button>
                ) : (
                  <Button type="primary" onClick={() => openEditor()}>
                    New supplier
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </div>

      <Modal
        title={editing ? 'Edit Supplier' : 'New Supplier'}
        open={modalOpen}
        onCancel={closeEditor}
        onOk={() => {
          void submit();
        }}
        okText={editing ? 'Save' : 'Create'}
        confirmLoading={saving}
        width={720}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Company / shop name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input placeholder="e.g. 中山市XX水族用品厂" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="main_category" label="Main category">
                <Input placeholder="e.g. 鱼缸过滤器" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_name" label="Contact person">
                <Input placeholder="Contact name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="wechat" label="WeChat / Wangwang">
                <Input placeholder="WeChat or Aliwangwang" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                <Input placeholder="name@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="platform" label="Platform">
                <Select options={PLATFORM_OPTIONS} placeholder="Select platform" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shop_url" label="Shop URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="province" label="Province">
                <Input placeholder="e.g. 广东" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input placeholder="e.g. 中山" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="years_on_platform" label="Years on platform">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="repeat_rate" label="Repeat rate (%)">
                <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="min_order_qty" label="MOQ">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="score" label="Score (0-100)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="certifications" label="Certifications">
                <Input placeholder="CE / UL / FCC ..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select options={STATUS_OPTIONS} placeholder="Select status" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={3} placeholder="Internal notes" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={
          productsFor ? (
            <Space direction="vertical" size={0}>
              <span>{productsFor.name}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-secondary, #888)' }}>
                {products.length} product{products.length === 1 ? '' : 's'} · purchase order worklist
              </span>
            </Space>
          ) : (
            'Supplied products'
          )
        }
        open={Boolean(productsFor)}
        onClose={() => setProductsFor(undefined)}
        width={900}
        destroyOnHidden
      >
        {productsFor?.shop_url ? (
          <div style={{ marginBottom: 12 }}>
            <Button
              size="small"
              icon={<ShoppingCartOutlined />}
              href={productsFor.shop_url}
              target="_blank"
              rel="noreferrer"
            >
              Open supplier shop
            </Button>
            {productsFor.phone ? (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {productsFor.phone}
              </Tag>
            ) : null}
          </div>
        ) : null}

        <Table<ApiSupplierProduct>
          rowKey="product_id"
          size="small"
          loading={productsLoading}
          dataSource={products}
          pagination={false}
          locale={{
            emptyText: <Empty description="No products linked to this supplier yet." />,
          }}
          columns={[
            {
              title: 'Product',
              dataIndex: 'name',
              render: (_, record) => (
                <Space align="start">
                  {record.featured_image ? (
                    <Image
                      src={record.featured_image}
                      width={48}
                      height={48}
                      style={{ objectFit: 'cover', borderRadius: 6 }}
                      preview={false}
                    />
                  ) : null}
                  <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 600 }}>{record.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
                      {record.sku}
                      {record.is_primary ? (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          primary
                        </Tag>
                      ) : null}
                    </span>
                  </Space>
                </Space>
              ),
            },
            {
              title: 'Cost',
              dataIndex: 'source_price',
              width: 100,
              render: (_, record) => cny(record.source_price),
            },
            {
              title: 'MOQ',
              dataIndex: 'moq',
              width: 80,
              render: (_, record) => record.moq ?? '—',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 100,
              render: (_, record) => <Tag>{record.status}</Tag>,
            },
            {
              title: 'Order',
              dataIndex: 'offer_url',
              width: 110,
              render: (_, record) =>
                record.offer_url ? (
                  <Button type="link" size="small" href={record.offer_url} target="_blank" rel="noreferrer">
                    {record.offer_id ?? '1688'}
                  </Button>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
}
