import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Avatar, Button, Form, Popconfirm, Space, Switch, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  flattenCategories,
  getCategoryTree,
  moveCategory,
  updateCategory,
} from '@/api/modules/category.api';
import type { CategoryCreateParams, CategoryTree, CategoryUpdateParams } from '@/types/api';

interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
}

const DEFAULT_CATEGORY: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  parent_id: null,
  display_order: 0,
  is_active: true,
  image_url: '',
  meta_title: '',
  meta_description: '',
};

const findSubtreeIds = (node: CategoryTree): number[] => [
  node.id,
  ...node.children.flatMap(findSubtreeIds),
];

const findNode = (nodes: CategoryTree[], id: number): CategoryTree | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
};

export default function CategoryList() {
  const [form] = Form.useForm<CategoryFormValues>();
  const [tree, setTree] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [editing, setEditing] = useState<CategoryTree>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { message } = App.useApp();

  const fetchTree = useCallback(() => getCategoryTree(includeInactive), [includeInactive]);

  const load = async () => {
    try {
      setTree(await fetchTree());
    } catch {
      void message.error('Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchTree()
      .then((next) => {
        if (!active) return;
        setTree(next);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        void message.error('Unable to load categories');
      });
    return () => {
      active = false;
    };
  }, [fetchTree, message]);

  const excludedIds = editing ? findSubtreeIds(findNode(tree, editing.id) ?? editing) : [];
  const parentOptions = flattenCategories(tree).filter(
    (option) => !excludedIds.includes(option.value),
  );

  const openEditor = (category?: CategoryTree) => {
    setEditing(category);
    form.resetFields();
    form.setFieldsValue(
      category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            parent_id: category.parent_id,
            display_order: category.display_order,
            is_active: category.is_active,
            image_url: category.image_url ?? '',
            meta_title: category.meta_title ?? '',
            meta_description: category.meta_description ?? '',
          }
        : DEFAULT_CATEGORY,
    );
    setDrawerOpen(true);
  };

  const remove = async (category: CategoryTree) => {
    try {
      await deleteCategory(category.id);
      await load();
      void message.success('Category deleted');
    } catch {
      void message.error('Unable to delete category. Move or remove its children first.');
    }
  };

  const columns: ProColumns<CategoryTree>[] = [
    {
      title: 'Category',
      dataIndex: 'name',
      width: 320,
      render: (_, category) => (
        <Space>
          <Avatar shape="square" size={36} src={category.image_url} icon={<ApartmentOutlined />} />
          <Space direction="vertical" size={0}>
            <Typography.Text strong={!category.parent_id}>{category.name}</Typography.Text>
            <Typography.Text type="secondary">{category.slug}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      width: 100,
      render: (_, category) =>
        category.is_active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    { title: 'Order', dataIndex: 'display_order', width: 90 },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      responsive: ['lg'],
      render: (_, category) => category.description || '—',
    },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      width: 130,
      responsive: ['xl'],
      render: (_, category) => (category.created_at ? category.created_at.slice(0, 10) : '—'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 110,
      fixed: 'right',
      render: (_, category) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${category.name}`}
            onClick={() => openEditor(category)}
          />
          <Popconfirm
            title={`Delete ${category.name}?`}
            description="Remove its children first; categories with products may be protected."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              void remove(category);
            }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${category.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Categories"
      subTitle="Nested product categories stored in pet-api."
      extra={
        <Space>
          <Space size={8}>
            <span>Show inactive</span>
            <Switch
              checked={includeInactive}
              onChange={(next) => {
                setLoading(true);
                setIncludeInactive(next);
              }}
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New Category
          </Button>
        </Space>
      }
    >
      <ProTable<CategoryTree>
        rowKey="id"
        headerTitle="Category tree"
        columns={columns}
        dataSource={tree}
        loading={loading}
        search={false}
        pagination={false}
        options={false}
        scroll={{ x: 900 }}
        expandable={{ defaultExpandAllRows: true }}
      />

      <DrawerForm<CategoryFormValues>
        title={editing ? 'Edit Category' : 'New Category'}
        width={560}
        form={form}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialValues={DEFAULT_CATEGORY}
        submitter={{
          searchConfig: {
            submitText: editing ? 'Save Changes' : 'Create Category',
            resetText: 'Cancel',
          },
        }}
        onFinish={async (values) => {
          const payload: CategoryCreateParams = {
            name: values.name,
            slug: values.slug,
            description: values.description || null,
            parent_id: values.parent_id ?? null,
            display_order: values.display_order,
            is_active: values.is_active,
            image_url: values.image_url || null,
            meta_title: values.meta_title || null,
            meta_description: values.meta_description || null,
          };
          try {
            if (editing) {
              const update: CategoryUpdateParams = { ...payload };
              delete update.parent_id;
              await updateCategory(editing.id, update);
              if ((editing.parent_id ?? null) !== (values.parent_id ?? null)) {
                await moveCategory(editing.id, values.parent_id ?? null);
              }
            } else {
              await createCategory(payload);
            }
            await load();
            void message.success(editing ? 'Category updated' : 'Category created');
            return true;
          } catch {
            void message.error(
              editing
                ? 'Unable to update category'
                : 'Unable to create category. Check the slug and parent.',
            );
            return false;
          }
        }}
      >
        <ProFormText name="name" label="Name" rules={[{ required: true, whitespace: true }]} />
        <ProFormText
          name="slug"
          label="Slug"
          rules={[
            { required: true, whitespace: true },
            { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Use lowercase kebab-case' },
          ]}
        />
        <ProFormTextArea name="description" label="Description" />
        <ProFormSelect
          name="parent_id"
          label="Parent category"
          options={parentOptions}
          allowClear
          showSearch
          placeholder="Leave empty for a top-level category"
        />
        <Space size={16} style={{ display: 'flex' }} align="start">
          <ProFormDigit name="display_order" label="Display order" min={0} />
          <ProFormSwitch name="is_active" label="Active" />
        </Space>
        <ProFormText name="image_url" label="Image URL" />
        <ProFormText name="meta_title" label="Meta title" />
        <ProFormTextArea name="meta_description" label="Meta description" />
        <Typography.Text type="secondary">
          Moving a category keeps its subtree; the API rejects moving a category into its own
          descendants.
        </Typography.Text>
      </DrawerForm>
    </PageContainer>
  );
}
