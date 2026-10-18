import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { DrawerForm, PageContainer, ProFormText, ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Popconfirm, Space, Tag } from 'antd';
import { useState } from 'react';
import { createTag, deleteTag, getTagList, updateTag } from '@/api/modules/tag.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type { ApiTag, ListParams, TagCreateParams } from '@/types/api';

interface TagFormValues {
  name: string;
  slug: string;
}

const DEFAULT_TAG: TagFormValues = { name: '', slug: '' };

export default function TagList() {
  const [form] = Form.useForm<TagFormValues>();
  const [editing, setEditing] = useState<ApiTag>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { message } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiTag, ListParams>({
    fetchData: getTagList,
    headerTitle: 'Tags',
  });

  const openEditor = (tag?: ApiTag) => {
    setEditing(tag);
    form.resetFields();
    form.setFieldsValue(tag ? { name: tag.name, slug: tag.slug } : DEFAULT_TAG);
    setDrawerOpen(true);
  };

  const remove = async (tag: ApiTag) => {
    try {
      await deleteTag(tag.id);
      await actionRef.current?.reload();
      void message.success('Tag deleted');
    } catch {
      void message.error('Unable to delete tag');
    }
  };

  const columns: ProColumns<ApiTag>[] = [
    { title: '#', dataIndex: 'id', width: 70, responsive: ['lg'] },
    {
      title: 'Tag',
      dataIndex: 'name',
      render: (_, tag) => (
        <Space>
          <TagsOutlined />
          <span>{tag.name}</span>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      render: (_, tag) => <Tag>{tag.slug}</Tag>,
    },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      width: 140,
      responsive: ['lg'],
      render: (_, tag) => (tag.created_at ? tag.created_at.slice(0, 10) : '—'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 110,
      fixed: 'right',
      render: (_, tag) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${tag.name}`}
            onClick={() => openEditor(tag)}
          />
          <Popconfirm
            title={`Delete ${tag.name}?`}
            description="Products using this tag lose it."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              void remove(tag);
            }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${tag.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Tags"
      subTitle="Reusable product tags stored in pet-api."
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
          New Tag
        </Button>
      }
    >
      <ProTable<ApiTag, ListParams>
        {...defaultProTableProps}
        columns={columns}
        search={false}
        scroll={{ x: 700 }}
        defaultSize={
          settings.density === 'small' ? 'small' : settings.density === 'large' ? 'large' : 'middle'
        }
        pagination={{
          defaultPageSize: settings.pageSize,
          showSizeChanger: true,
          showTotal: (total, range) => `Showing ${range[0]}–${range[1]} of ${total} results`,
        }}
      />

      <DrawerForm<TagFormValues>
        title={editing ? 'Edit Tag' : 'New Tag'}
        width={480}
        form={form}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialValues={DEFAULT_TAG}
        submitter={{
          searchConfig: {
            submitText: editing ? 'Save Changes' : 'Create Tag',
            resetText: 'Cancel',
          },
        }}
        onFinish={async (values) => {
          const payload: TagCreateParams = { name: values.name, slug: values.slug };
          try {
            if (editing) await updateTag(editing.id, payload);
            else await createTag(payload);
            await actionRef.current?.reload();
            void message.success(editing ? 'Tag updated' : 'Tag created');
            return true;
          } catch {
            void message.error(
              editing ? 'Unable to update tag' : 'Unable to create tag. Check the slug.',
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
      </DrawerForm>
    </PageContainer>
  );
}
