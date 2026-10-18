import {
  CopyOutlined,
  DeleteOutlined,
  FileOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
  QueryFilter,
} from '@ant-design/pro-components';
import { App, Button, Card, Image, Space, Tag, Typography, Upload } from 'antd';
import { useState } from 'react';
import { deleteMedia, getMediaList, mediaUrl, uploadMedia } from '@/api/modules/media.api';
import { useProTable } from '@/hooks/useProTable';
import { useSettings } from '@/contexts/SettingsContext';
import type { ApiMedia, MediaAggregateType, MediaQueryParams } from '@/types/api';

const TYPE_OPTIONS: Array<{ value: MediaAggregateType; label: string }> = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
  { value: 'archive', label: 'Archive' },
  { value: 'other', label: 'Other' },
];

const TYPE_COLOR: Record<MediaAggregateType, string> = {
  image: 'blue',
  video: 'purple',
  audio: 'orange',
  document: 'green',
  archive: 'gold',
  other: 'default',
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

export default function MediaList() {
  const [params, setParams] = useState<MediaQueryParams>({});
  const [uploading, setUploading] = useState(false);
  const { message, modal } = App.useApp();
  const { settings } = useSettings();
  const { actionRef, defaultProTableProps } = useProTable<ApiMedia, MediaQueryParams>({
    fetchData: getMediaList,
    headerTitle: 'Media',
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await uploadMedia(file);
      await actionRef.current?.reload();
      void message.success(`${file.name} uploaded`);
    } catch {
      void message.error(`Unable to upload ${file.name}. Files must be 10MB or smaller.`);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (media: ApiMedia) => {
    try {
      await deleteMedia(media.id);
      await actionRef.current?.reload();
      void message.success('Media deleted');
    } catch {
      void message.error('Unable to delete media');
    }
  };

  const copyUrl = async (media: ApiMedia) => {
    try {
      await navigator.clipboard.writeText(mediaUrl(media.url) ?? media.url);
      void message.success('URL copied');
    } catch {
      void message.error('Unable to copy the URL');
    }
  };

  const columns: ProColumns<ApiMedia>[] = [
    {
      title: 'Preview',
      dataIndex: 'url',
      width: 110,
      render: (_, media) =>
        media.aggregate_type === 'image' ? (
          <Image
            src={mediaUrl(media.url)}
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <Space>
            <FileOutlined />
            <Typography.Text type="secondary">{media.extension.toUpperCase()}</Typography.Text>
          </Space>
        ),
    },
    {
      title: 'File',
      dataIndex: 'filename',
      ellipsis: true,
      render: (_, media) => (
        <Typography.Link href={mediaUrl(media.url)} target="_blank" rel="noreferrer">
          {media.filename}
        </Typography.Link>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'aggregate_type',
      width: 120,
      render: (_, media) => (
        <Tag color={TYPE_COLOR[media.aggregate_type]}>{media.aggregate_type}</Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
      render: (_, media) => formatSize(media.size),
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      width: 140,
      responsive: ['lg'],
      render: (_, media) => (media.created_at ? media.created_at.slice(0, 10) : '—'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, media) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<CopyOutlined />}
            aria-label={`Copy URL for ${media.filename}`}
            onClick={() => void copyUrl(media)}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete ${media.filename}`}
            onClick={() => {
              modal.confirm({
                title: `Delete ${media.filename}?`,
                content: 'The file is removed from storage and from every product that uses it.',
                okText: 'Delete',
                okButtonProps: { danger: true },
                onOk: () => {
                  void remove(media);
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Media"
      subTitle="Images and files stored by pet-api. Uploads are capped at 10MB."
      extra={
        <Upload
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            void upload(file);
            return Upload.LIST_IGNORE;
          }}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            Upload
          </Button>
        </Upload>
      }
    >
      <div className="section-stack">
        <Card styles={{ body: { padding: '8px 24px' } }}>
          <QueryFilter<MediaQueryParams>
            defaultCollapsed={false}
            span={{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 8 }}
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
            <ProFormText name="filename" label="Filename" />
            <ProFormSelect
              name="aggregate_type"
              label="Type"
              options={TYPE_OPTIONS}
              placeholder="All types"
            />
          </QueryFilter>
        </Card>
        <ProTable<ApiMedia, MediaQueryParams>
          {...defaultProTableProps}
          columns={columns}
          params={params}
          search={false}
          scroll={{ x: 800 }}
          defaultSize={
            settings.density === 'small'
              ? 'small'
              : settings.density === 'large'
                ? 'large'
                : 'middle'
          }
          pagination={{
            defaultPageSize: 12,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]}–${range[1]} of ${total} files`,
          }}
          locale={{
            emptyText: (
              <Space direction="vertical">
                <InboxOutlined style={{ fontSize: 32 }} />
                <Typography.Text type="secondary">
                  No media yet. Upload images here, then attach them from a product.
                </Typography.Text>
              </Space>
            ),
          }}
        />
      </div>
    </PageContainer>
  );
}
