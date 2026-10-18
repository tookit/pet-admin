import { DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DrawerForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Drawer, Form, Input, Popconfirm, Space, Switch, Tag, Typography } from 'antd';
import { useState } from 'react';
import {
  addAttributeValue,
  createAttribute,
  deleteAttribute,
  deleteAttributeValue,
  getAttribute,
  getAttributeList,
  updateAttribute,
} from '@/api/modules/attribute.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type {
  ApiAttribute,
  AttributeCreateParams,
  AttributeQueryParams,
  AttributeType,
} from '@/types/api';

const TYPE_OPTIONS: Array<{ value: AttributeType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
];

interface AttributeFormValues {
  name: string;
  slug: string;
  type: AttributeType;
  unit?: string;
  filterable: boolean;
  is_required: boolean;
  display_order: number;
}

const DEFAULT_ATTRIBUTE: AttributeFormValues = {
  name: '',
  slug: '',
  type: 'text',
  unit: '',
  filterable: false,
  is_required: false,
  display_order: 0,
};

export default function AttributeList() {
  const [form] = Form.useForm<AttributeFormValues>();
  const [editing, setEditing] = useState<ApiAttribute>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [managing, setManaging] = useState<ApiAttribute>();
  const [newValue, setNewValue] = useState('');
  const [savingValue, setSavingValue] = useState(false);
  const [filterableOnly, setFilterableOnly] = useState(false);
  const { message } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiAttribute, AttributeQueryParams>({
    fetchData: getAttributeList,
    headerTitle: 'Attributes',
  });

  const openEditor = (attribute?: ApiAttribute) => {
    setEditing(attribute);
    form.resetFields();
    form.setFieldsValue(
      attribute
        ? {
            name: attribute.name,
            slug: attribute.slug,
            type: attribute.type,
            unit: attribute.unit ?? '',
            filterable: attribute.filterable,
            is_required: attribute.is_required,
            display_order: attribute.display_order,
          }
        : DEFAULT_ATTRIBUTE,
    );
    setDrawerOpen(true);
  };

  const refreshManaging = async (id: number) => {
    const next = await getAttribute(id);
    setManaging(next);
    await actionRef.current?.reload();
  };

  const addValue = async () => {
    if (!managing || !newValue.trim()) return;
    setSavingValue(true);
    try {
      await addAttributeValue(managing.id, { value: newValue.trim() });
      await refreshManaging(managing.id);
      setNewValue('');
      void message.success('Value added');
    } catch {
      void message.error('Unable to add value');
    } finally {
      setSavingValue(false);
    }
  };

  const removeValue = async (valueId: number) => {
    if (!managing) return;
    try {
      await deleteAttributeValue(managing.id, valueId);
      await refreshManaging(managing.id);
      void message.success('Value removed');
    } catch {
      void message.error('Unable to remove value');
    }
  };

  const columns: ProColumns<ApiAttribute>[] = [
    { title: 'Attribute', dataIndex: 'name', width: 200 },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 160,
      render: (_, attribute) => <Tag>{attribute.slug}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 110,
      render: (_, attribute) => (
        <Tag color="blue">
          {attribute.type}
          {attribute.unit ? ` (${attribute.unit})` : ''}
        </Tag>
      ),
    },
    {
      title: 'Values',
      dataIndex: 'values',
      render: (_, attribute) =>
        attribute.values.length ? (
          <Space size={4} wrap>
            {attribute.values.map((value) => (
              <Tag key={value.id}>{value.value}</Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Filterable',
      dataIndex: 'filterable',
      width: 100,
      render: (_, attribute) => (attribute.filterable ? 'Yes' : 'No'),
    },
    {
      title: 'Required',
      dataIndex: 'is_required',
      width: 100,
      render: (_, attribute) => (attribute.is_required ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 170,
      fixed: 'right',
      render: (_, attribute) => (
        <Space size={4}>
          <Button size="small" onClick={() => setManaging(attribute)}>
            Values
          </Button>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${attribute.name}`}
            onClick={() => openEditor(attribute)}
          />
          <Popconfirm
            title={`Delete ${attribute.name}?`}
            description="Products using this attribute lose the property."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              void (async () => {
                try {
                  await deleteAttribute(attribute.id);
                  await actionRef.current?.reload();
                  void message.success('Attribute deleted');
                } catch {
                  void message.error('Unable to delete attribute');
                }
              })();
            }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${attribute.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Attributes"
      subTitle="Product specification attributes and their allowed values."
      extra={
        <Space>
          <Space size={8}>
            <span>Filterable only</span>
            <Switch checked={filterableOnly} onChange={setFilterableOnly} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New Attribute
          </Button>
        </Space>
      }
    >
      <ProTable<ApiAttribute, AttributeQueryParams>
        {...defaultProTableProps}
        columns={columns}
        search={false}
        scroll={{ x: 1000 }}
        params={filterableOnly ? { filterable_only: true } : {}}
        defaultSize={
          settings.density === 'small' ? 'small' : settings.density === 'large' ? 'large' : 'middle'
        }
        pagination={{
          defaultPageSize: settings.pageSize,
          showSizeChanger: true,
          showTotal: (total, range) => `Showing ${range[0]}–${range[1]} of ${total} results`,
        }}
        toolBarRender={() => [
          <Typography.Text key="hint" type="secondary">
            <InfoCircleOutlined /> Values can be added from the Values action.
          </Typography.Text>,
        ]}
      />

      <DrawerForm<AttributeFormValues>
        title={editing ? 'Edit Attribute' : 'New Attribute'}
        width={520}
        form={form}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialValues={DEFAULT_ATTRIBUTE}
        submitter={{
          searchConfig: {
            submitText: editing ? 'Save Changes' : 'Create Attribute',
            resetText: 'Cancel',
          },
        }}
        onFinish={async (values) => {
          const payload: AttributeCreateParams = {
            name: values.name,
            slug: values.slug,
            type: values.type,
            unit: values.unit || null,
            filterable: values.filterable,
            is_required: values.is_required,
            display_order: values.display_order,
          };
          try {
            if (editing) await updateAttribute(editing.id, payload);
            else await createAttribute(payload);
            await actionRef.current?.reload();
            void message.success(editing ? 'Attribute updated' : 'Attribute created');
            return true;
          } catch {
            void message.error('Unable to save attribute. Check the slug.');
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
        <ProFormSelect name="type" label="Type" options={TYPE_OPTIONS} />
        <ProFormText name="unit" label="Unit" placeholder="e.g. cm, kg" />
        <Space size={16} style={{ display: 'flex' }} align="start">
          <ProFormDigit name="display_order" label="Display order" min={0} />
          <ProFormSwitch name="filterable" label="Filterable" />
          <ProFormSwitch name="is_required" label="Required" />
        </Space>
      </DrawerForm>

      <Drawer
        title={managing ? `${managing.name} values` : 'Values'}
        width={480}
        open={!!managing}
        onClose={() => setManaging(undefined)}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={newValue}
              placeholder="Add a value"
              onChange={(event) => setNewValue(event.target.value)}
              onPressEnter={() => void addValue()}
            />
            <Button type="primary" loading={savingValue} onClick={() => void addValue()}>
              Add
            </Button>
          </Space.Compact>
          <Space size={8} wrap>
            {managing?.values.length ? (
              managing.values.map((value) => (
                <Tag key={value.id} closable onClose={() => void removeValue(value.id)}>
                  {value.value}
                </Tag>
              ))
            ) : (
              <Typography.Text type="secondary">No values yet.</Typography.Text>
            )}
          </Space>
        </Space>
      </Drawer>
    </PageContainer>
  );
}
