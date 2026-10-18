import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  App,
  Button,
  Empty,
  Image,
  Input,
  Pagination,
  Segmented,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { deleteMedia, getMediaList, mediaUrl, uploadMedia } from '@/api/modules/media.api';
import { RowActions } from '@/components/RowActions';
import type { ApiMedia, MediaAggregateType, MediaQueryParams } from '@/types/api';

const TYPES: Array<{ value: MediaAggregateType; label: string }> = [
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'archive', label: 'Archives' },
  { value: 'other', label: 'Other' },
];

const TYPE_LABEL = Object.fromEntries(TYPES.map((type) => [type.value, type.label])) as Record<
  MediaAggregateType,
  string
>;

const TYPE_COLOR: Record<MediaAggregateType, string> = {
  image: 'green',
  video: 'blue',
  audio: 'purple',
  document: 'gold',
  archive: 'default',
  other: 'default',
};

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

function MediaCard({
  media,
  onCopy,
  onDelete,
}: {
  media: ApiMedia;
  onCopy: (media: ApiMedia) => void;
  onDelete: (media: ApiMedia) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const url = mediaUrl(media.url) ?? media.url;
  const isImage = media.aggregate_type === 'image';

  return (
    <div className="media-card">
      <div className="media-card__thumb">
        {isImage ? (
          <>
            <img src={url} alt="" loading="lazy" />
            <Image
              style={{ display: 'none' }}
              src={url}
              preview={{ visible: previewOpen, onVisibleChange: setPreviewOpen }}
            />
          </>
        ) : (
          <FileTextOutlined className="media-card__file-icon" />
        )}
        <div className="media-card__overlay">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              isImage ? setPreviewOpen(true) : window.open(url, '_blank', 'noopener')
            }
          >
            Preview
          </Button>
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => onCopy(media)}>
            Copy URL
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(media)}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="media-card__body">
        <div className="media-card__name" title={media.filename}>
          {media.filename}
        </div>
        <div className="media-card__meta">
          {formatSize(media.size)} · {media.extension.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/**
 * Media library (design: adminpro-design-docs/media.md), adapted to pet-api:
 * the API has no folders, usage references or rename endpoint, so the left
 * rail groups by `aggregate_type` and cards carry no usage tag.
 */
export default function MediaList() {
  const [selectedType, setSelectedType] = useState<MediaAggregateType>();
  const [params, setParams] = useState<MediaQueryParams>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [items, setItems] = useState<ApiMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [pendingUploads, setPendingUploads] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { message, modal } = App.useApp();

  useEffect(() => {
    let active = true;
    getMediaList({ ...params, current: page, pageSize })
      .then((response) => {
        if (!active) return;
        setItems(response.result);
        setTotal(response.total);
      })
      .catch(() => {
        if (active) void message.error('Unable to load the media library');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params, page, pageSize, refreshKey, message]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getMediaList({ pageSize: 1 }),
      ...TYPES.map((type) => getMediaList({ aggregate_type: type.value, pageSize: 1 })),
    ])
      .then(([all, ...perType]) => {
        if (!active) return;
        const next: Record<string, number> = { all: all.total };
        TYPES.forEach((type, index) => {
          next[type.value] = perType[index].total;
        });
        setCounts(next);
      })
      .catch(() => {
        if (active) setCounts({});
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const chooseType = (type?: MediaAggregateType) => {
    setLoading(true);
    setSelectedType(type);
    setParams((current) => ({ ...current, aggregate_type: type }));
    setPage(1);
  };

  const search = (filename: string) => {
    setLoading(true);
    setParams((current) => ({ ...current, filename: filename.trim() || undefined }));
    setPage(1);
  };

  const upload = async (file: File) => {
    setPendingUploads((count) => count + 1);
    try {
      await uploadMedia(file);
      setLoading(true);
      setRefreshKey((key) => key + 1);
      void message.success(`${file.name} uploaded`);
    } catch {
      void message.error(`Unable to upload ${file.name}. Files must be 10 MB or smaller.`);
    } finally {
      setPendingUploads((count) => count - 1);
    }
  };

  const remove = (media: ApiMedia) => {
    modal.confirm({
      title: `Delete ${media.filename}?`,
      content: 'The file is removed from storage and from every product that uses it.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMedia(media.id);
          setLoading(true);
          setRefreshKey((key) => key + 1);
          void message.success('Media deleted');
        } catch {
          void message.error('Unable to delete media');
        }
      },
    });
  };

  const copyUrl = useCallback(
    async (media: ApiMedia) => {
      try {
        await navigator.clipboard.writeText(mediaUrl(media.url) ?? media.url);
        void message.success('URL copied');
      } catch {
        void message.error('Unable to copy the URL');
      }
    },
    [message],
  );

  const listColumns: ColumnsType<ApiMedia> = [
    {
      title: 'Preview',
      dataIndex: 'url',
      width: 100,
      render: (_, media) =>
        media.aggregate_type === 'image' ? (
          <Image
            src={mediaUrl(media.url)}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <FileTextOutlined style={{ fontSize: 24, color: 'var(--app-muted)' }} />
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
        <Tag color={TYPE_COLOR[media.aggregate_type]}>{TYPE_LABEL[media.aggregate_type]}</Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
      align: 'right',
      render: (_, media) => <span className="tabular-nums">{formatSize(media.size)}</span>,
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      width: 130,
      render: (_, media) => (
        <span className="tabular-nums">{media.created_at?.slice(0, 10) ?? '—'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, media) => (
        <RowActions
          label={`Actions for ${media.filename}`}
          items={[{ key: 'copy', label: 'Copy URL', onClick: () => void copyUrl(media) }]}
          deleteTitle={`Delete ${media.filename}?`}
          deleteContent="The file is removed from storage and from every product that uses it."
          onDelete={() => remove(media)}
        />
      ),
    },
  ];

  const uploadZone = (
    <Upload.Dragger
      multiple
      accept={ACCEPT}
      showUploadList={false}
      className="media-upload"
      beforeUpload={(file) => {
        if (file.size > MAX_BYTES) {
          void message.error(`${file.name} is larger than 10 MB`);
          return Upload.LIST_IGNORE;
        }
        void upload(file);
        return Upload.LIST_IGNORE;
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="media-upload__title">
        <strong>Click to upload</strong> or drag files here
      </p>
      <p className="media-upload__hint">
        JPG / PNG / WebP / PDF · up to 10 MB per file · multiple files supported
      </p>
    </Upload.Dragger>
  );

  const typeOptions = TYPES.map((type) => ({ value: type.value, label: type.label }));

  return (
    <PageContainer
      title="Media"
      subTitle="Product images and files stored by pet-api. Uploads are capped at 10 MB."
    >
      <div className="media-library">
        <nav className="media-folders" aria-label="Media types">
          <button
            type="button"
            className="media-folder"
            aria-current={!selectedType}
            onClick={() => chooseType(undefined)}
          >
            <FolderOpenOutlined />
            <span>All files</span>
            <span className="media-folder__count">{counts.all ?? '—'}</span>
          </button>
          {TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className="media-folder"
              aria-current={selectedType === type.value}
              onClick={() => chooseType(type.value)}
            >
              <FolderOpenOutlined />
              <span>{type.label}</span>
              <span className="media-folder__count">{counts[type.value] ?? '—'}</span>
            </button>
          ))}
        </nav>

        <div className="media-main">
          <div className="media-toolbar">
            <h3>
              {selectedType ? TYPE_LABEL[selectedType] : 'All files'}
              <span className="media-toolbar__count">{total}</span>
            </h3>
            <div className="media-toolbar__actions">
              <Select
                className="media-type-mobile"
                placeholder="All types"
                allowClear
                value={selectedType}
                options={typeOptions}
                onChange={(value) => chooseType(value)}
              />
              <Input.Search
                placeholder="Search filenames"
                allowClear
                onSearch={search}
                style={{ width: 220 }}
              />
              <Segmented
                value={view}
                onChange={(value) => setView(value as 'grid' | 'list')}
                options={[
                  { label: 'Grid', value: 'grid' },
                  { label: 'List', value: 'list' },
                ]}
              />
            </div>
          </div>

          {uploadZone}

          {loading ? (
            <div className="media-loading">
              <Spin />
            </div>
          ) : items.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No files match this view."
              className="media-empty"
            />
          ) : view === 'grid' ? (
            <div className="media-grid">
              {items.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  onCopy={(item) => void copyUrl(item)}
                  onDelete={remove}
                />
              ))}
            </div>
          ) : (
            <Table<ApiMedia>
              rowKey="id"
              columns={listColumns}
              dataSource={items}
              scroll={{ x: 800 }}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (count, range) => `Showing ${range[0]}–${range[1]} of ${count} files`,
                onChange: (nextPage, nextSize) => {
                  setLoading(true);
                  setPage(nextPage);
                  setPageSize(nextSize);
                },
              }}
            />
          )}

          {view === 'grid' && (
            <Pagination
              className="media-pagination"
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={[20, 40, 80]}
              showTotal={(count, range) => `Showing ${range[0]}–${range[1]} of ${count} files`}
              onChange={(nextPage, nextSize) => {
                setLoading(true);
                setPage(nextPage);
                setPageSize(nextSize);
              }}
            />
          )}

          {pendingUploads > 0 && (
            <Typography.Text type="secondary" className="media-uploading">
              <UploadOutlined /> Uploading {pendingUploads} file{pendingUploads === 1 ? '' : 's'}…
            </Typography.Text>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
