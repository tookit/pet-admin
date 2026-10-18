import { PageContainer } from '@ant-design/pro-components';
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Select,
  Skeleton,
  Tooltip,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState, type ReactNode } from 'react';
import MetricsRow, { type MetricItem } from '@/components/MetricsRow';
import { getDashboardOverview, type MetricKey } from '@/api/modules/dashboard.api';
import type { DashboardView, Granularity } from '@/types';
import { APP_CONFIG } from '@/constants/app';
import ChartDataTable from './ChartDataTable';
import DashboardCalendar from './DashboardCalendar';
import MyTasks from './MyTasks';
import RecentOrders from './RecentOrders';
import RevenueOverview from './RevenueOverview';
import TrafficSources from './TrafficSources';

const GRANULARITIES: Array<{ label: string; value: Granularity }> = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' },
];

const ICONS: Record<
  string,
  { icon: ReactNode; tone: 'primary' | 'success' | 'warning' | 'purple' }
> = {
  users: { icon: <UserOutlined />, tone: 'primary' },
  revenue: { icon: <WalletOutlined />, tone: 'success' },
  orders: { icon: <ShoppingCartOutlined />, tone: 'warning' },
  conversion: { icon: <BarChartOutlined />, tone: 'purple' },
};

const DEFAULT_RANGE: [Dayjs, Dayjs] = [dayjs().subtract(11, 'month').startOf('month'), dayjs()];

export default function DashboardPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>(DEFAULT_RANGE);
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [view, setView] = useState<DashboardView>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const from = range[0].format('YYYY-MM-DD');
  const to = range[1].format('YYYY-MM-DD');

  useEffect(() => {
    let active = true;
    getDashboardOverview(from, to, granularity)
      .then((next) => {
        if (!active) return;
        setView(next);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [from, to, granularity, attempt]);

  const items: MetricItem[] = (view?.metrics ?? []).map((metricItem) => ({
    label: metricItem.label,
    value: metricItem.value,
    prefix: metricItem.prefix,
    suffix: metricItem.suffix,
    icon: ICONS[metricItem.key].icon,
    tone: ICONS[metricItem.key].tone,
    trend: metricItem.trend,
  }));

  const loading = !view && !failed;

  return (
    <PageContainer
      title="Dashboard"
      subTitle={`Welcome back! Here's what's happening with ${APP_CONFIG.name} today.`}
      extra={
        <DatePicker.RangePicker
          allowClear={false}
          value={range}
          onChange={(next) => next?.[0] && next[1] && setRange([next[0], next[1]])}
        />
      }
    >
      {failed ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load analytics."
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
          <Card
            title="Revenue Overview"
            extra={
              <div className="card-controls">
                <Segmented<MetricKey>
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { label: 'Revenue', value: 'revenue' },
                    { label: 'Orders', value: 'orders' },
                  ]}
                />
                <Select<Granularity>
                  value={granularity}
                  onChange={setGranularity}
                  options={GRANULARITIES}
                  aria-label="Time granularity"
                />
              </div>
            }
          >
            <p className="card-description">Total revenue and orders over the selected range.</p>
            {view ? (
              <>
                <RevenueOverview data={view.series} metric={metric} />
                <ChartDataTable
                  caption={`${metric === 'revenue' ? 'Revenue' : 'Orders'} per ${granularity.replace('ly', '')} period`}
                  columns={['Period', metric === 'revenue' ? 'Revenue (USD)' : 'Orders']}
                  rows={view.series.map((point) => ({
                    key: point.period,
                    cells: [point.period, point[metric]],
                  }))}
                />
              </>
            ) : (
              <Skeleton active />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Traffic Sources">
            <p className="card-description">Where your visitors come from.</p>
            {view ? (
              <>
                <TrafficSources sources={view.traffic.sources} total={view.traffic.total} />
                <ChartDataTable
                  caption="Visits by traffic source"
                  columns={['Source', 'Visits', 'Share']}
                  rows={view.traffic.sources.map((source) => ({
                    key: source.name,
                    cells: [source.name, source.value, `${source.share}%`],
                  }))}
                />
              </>
            ) : (
              <Skeleton active />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="section-card">
        <Col xs={24} xl={12}>
          <Card
            title="Recent Orders"
            extra={
              <Tooltip title="An orders page is not part of this demo">
                <Button type="link" disabled>
                  View All
                </Button>
              </Tooltip>
            }
          >
            {view ? <RecentOrders orders={view.orders} /> : <Skeleton active />}
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="My Tasks">
            {view ? <MyTasks tasks={view.tasks} /> : <Skeleton active />}
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title="Calendar">
            {view ? <DashboardCalendar events={view.events} /> : <Skeleton active />}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
