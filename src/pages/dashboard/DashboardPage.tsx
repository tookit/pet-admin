import { PageContainer } from '@ant-design/pro-components';
import {
  AppstoreOutlined,
  CommentOutlined,
  FileTextOutlined,
  MailOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Empty, List, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricsRow, { type MetricItem } from '@/components/MetricsRow';
import { getDashboardData, type DashboardData, type TodoItem } from '@/api/modules/dashboard.api';
import { useAuth } from '@/contexts/AuthContext';
import { displayName } from '@/utils/user';
import ChartDataTable from './ChartDataTable';
import InquiryTrend from './InquiryTrend';

const TODO_TAG: Record<TodoItem['tone'], { color: string }> = {
  gold: { color: 'gold' },
  mint: { color: 'green' },
  gray: { color: 'default' },
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Dashboard per design/adminpro-design-docs/dashboard.md: KPI row + trend/to-dos. */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((next) => {
        if (!active) return;
        setData(next);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const kpis = data?.kpis;

  const items: MetricItem[] = kpis
    ? [
        (() => {
          const change = kpis.inquiriesYesterday
            ? ((kpis.inquiriesToday - kpis.inquiriesYesterday) / kpis.inquiriesYesterday) * 100
            : null;
          return {
            label: "Today's Inquiries",
            value: kpis.inquiriesToday,
            icon: <CommentOutlined />,
            trend: {
              text: change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
              caption: 'vs yesterday',
              direction: change == null ? 'flat' : change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat',
            },
          };
        })(),
        {
          label: 'Active Products',
          value: kpis.activeProducts,
          icon: <AppstoreOutlined />,
          detail: `${kpis.totalProducts} total in catalog`,
        },
        {
          label: 'Pending Review',
          value: kpis.draftProducts,
          icon: <FileTextOutlined />,
          tone: 'warning',
          detail: 'Draft products',
        },
        (() => {
          const change = kpis.inquiriesLastMonth
            ? ((kpis.inquiriesThisMonth - kpis.inquiriesLastMonth) / kpis.inquiriesLastMonth) * 100
            : null;
          return {
            label: 'Inquiries This Month',
            value: kpis.inquiriesThisMonth,
            icon: <MailOutlined />,
            trend: {
              text: change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
              caption: 'vs last month',
              direction: change == null ? 'flat' : change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat',
            },
          };
        })(),
      ]
    : [];

  const loading = !data && !failed;

  return (
    <PageContainer
      title={`${greeting()}, ${displayName(user)}`}
      subTitle={
        kpis ? (
          <span>
            There are <b style={{ color: 'var(--app-warning)' }}>{kpis.draftProducts} products</b>{' '}
            awaiting review and{' '}
            <b style={{ color: 'var(--app-warning)' }}>{kpis.inquiriesToday} new inquiries</b> today.
          </span>
        ) : (
          'Loading overview…'
        )
      }
    >
      {failed ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load the overview."
          description="The dashboard figures could not be read. Retry, or reload the page."
          action={
            <Button size="small" onClick={() => setAttempt((value) => value + 1)}>
              Retry
            </Button>
          }
        />
      ) : loading ? (
        <Row gutter={[16, 16]}>
          {['a', 'b', 'c', 'd'].map((key) => (
            <Col xs={24} md={12} xl={6} key={key}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <MetricsRow items={items} />
      )}

      <Row gutter={[16, 16]} className="section-card">
        <Col xs={24} xl={16}>
          <Card title="Inquiry Trend">
            <p className="card-description">New inquiries over the last 30 days.</p>
            {data ? (
              <>
                <InquiryTrend data={data.series} />
                <ChartDataTable
                  caption="Daily inquiries over the last 30 days"
                  columns={['Day', 'Inquiries']}
                  rows={data.series.map((point) => ({
                    key: point.period,
                    cells: [point.period, point.inquiries],
                  }))}
                />
              </>
            ) : (
              <Skeleton active />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="To-do">
            {data ? (
              <List<TodoItem>
                dataSource={data.todos}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing pending — you're all caught up." />,
                }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="go"
                        type="link"
                        aria-label={`Open ${item.path}`}
                        onClick={() => void navigate(item.path)}
                      >
                        Open <RightOutlined />
                      </Button>,
                    ]}
                  >
                    <Space size={8}>
                      <Tag {...TODO_TAG[item.tone]}>{item.meta}</Tag>
                      <Typography.Text>{item.label}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Skeleton active />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
