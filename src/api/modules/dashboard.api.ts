import dayjs from 'dayjs';
import { mockApi } from '@/mocks/api';
import type { DailyPoint, DashboardView, Granularity, KpiMetric, SeriesPoint } from '@/types';

export type MetricKey = 'revenue' | 'orders';

const sum = (points: DailyPoint[], field: 'revenue' | 'orders' | 'visits') =>
  points.reduce((total, point) => total + point[field], 0);

/** Currency for the KPI tile and the axis; the chart tooltip formats the same way. */
export const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatCompact = (value: number) =>
  value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 0 });

function bucket(points: DailyPoint[], granularity: Granularity): SeriesPoint[] {
  const buckets = new Map<string, SeriesPoint>();
  for (const point of points) {
    const date = dayjs(point.date);
    const start =
      granularity === 'daily'
        ? date
        : granularity === 'weekly'
          ? date.startOf('week')
          : date.startOf('month');
    const period = granularity === 'monthly' ? start.format('MMM YY') : start.format('MMM D');
    const current = buckets.get(period) ?? { period, revenue: 0, orders: 0 };
    current.revenue += point.revenue;
    current.orders += point.orders;
    buckets.set(period, current);
  }
  return [...buckets.values()];
}

/** Signed change between two windows, as a percentage rendered by the KPI tile. */
function trend(current: number, previous: number, caption: string): KpiMetric['trend'] {
  if (!previous) return { text: '—', caption, direction: 'flat' };
  const change = ((current - previous) / previous) * 100;
  const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';
  return {
    text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
    caption,
    direction,
  };
}

/**
 * Aggregates the raw daily series into the view the dashboard renders. Keeps the
 * `DashboardView` contract so a real backend can replace it wholesale.
 */
export async function getDashboardOverview(
  from: string,
  to: string,
  granularity: Granularity,
): Promise<DashboardView> {
  const snapshot = await mockApi.getDashboard();
  const start = dayjs(from);
  const end = dayjs(to);
  const length = Math.max(end.diff(start, 'day') + 1, 1);

  const inRange = (point: DailyPoint) =>
    !dayjs(point.date).isBefore(start, 'day') && !dayjs(point.date).isAfter(end, 'day');
  const window = snapshot.daily.filter(inRange);
  const previousWindow = snapshot.daily.filter(
    (point) =>
      !dayjs(point.date).isBefore(start.subtract(length, 'day'), 'day') &&
      dayjs(point.date).isBefore(start, 'day'),
  );

  const revenue = sum(window, 'revenue');
  const orders = sum(window, 'orders');
  const visits = sum(window, 'visits');
  const conversion = visits ? (orders / visits) * 100 : 0;
  const previousConversion = sum(previousWindow, 'visits')
    ? (sum(previousWindow, 'orders') / sum(previousWindow, 'visits')) * 100
    : 0;

  const metrics: KpiMetric[] = [
    {
      key: 'users',
      label: 'Total Users',
      value: snapshot.userCount,
      trend: {
        text: `${snapshot.activeUsers} active`,
        caption: 'across your organization',
        direction: 'flat',
      },
    },
    {
      key: 'revenue',
      label: 'Revenue',
      value: revenue,
      prefix: '$',
      trend: trend(revenue, sum(previousWindow, 'revenue'), 'vs previous period'),
    },
    {
      key: 'orders',
      label: 'Orders',
      value: orders,
      trend: trend(orders, sum(previousWindow, 'orders'), 'vs previous period'),
    },
    {
      key: 'conversion',
      label: 'Conversion Rate',
      value: Number(conversion.toFixed(1)),
      suffix: '%',
      trend: trend(conversion, previousConversion, 'vs previous period'),
    },
  ];

  return {
    metrics,
    series: bucket(window, granularity),
    traffic: {
      total: visits,
      sources: snapshot.trafficSources.map((source) => ({
        name: source.name,
        share: source.share,
        value: Math.round((visits * source.share) / 100),
      })),
    },
    orders: snapshot.orders,
    tasks: snapshot.tasks,
    events: snapshot.events,
  };
}
