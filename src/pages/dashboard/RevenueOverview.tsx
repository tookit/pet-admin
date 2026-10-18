import { Area } from '@ant-design/plots';
import { formatCompact, formatCurrency, type MetricKey } from '@/api/modules/dashboard.api';
import { CHART_TOKENS, NO_ENTRY_ANIMATION } from '@/constants/app';
import type { SeriesPoint } from '@/types';

const AXIS = {
  x: {
    title: false,
    line: false,
    tick: false,
    grid: false,
    labelFill: CHART_TOKENS.axisLabel,
    labelFontSize: 12,
  },
  y: {
    title: false,
    line: false,
    tick: false,
    gridLineWidth: 1,
    gridStroke: CHART_TOKENS.grid,
    labelFill: CHART_TOKENS.axisLabel,
    labelFontSize: 12,
  },
} as const;

/**
 * One measure at a time, so one hue: the Revenue/Orders switch changes the field
 * being plotted, never the colour of a series. The card title names the measure,
 * so there is no legend box.
 */
export default function RevenueOverview({
  data,
  metric,
}: {
  data: SeriesPoint[];
  metric: MetricKey;
}) {
  const format = metric === 'revenue' ? formatCurrency : (value: number) => `${value}`;
  return (
    <Area
      {...NO_ENTRY_ANIMATION}
      data={data}
      xField="period"
      yField={metric}
      height={280}
      legend={false}
      style={{ fill: CHART_TOKENS.series, fillOpacity: CHART_TOKENS.seriesFillOpacity }}
      line={{
        style: {
          stroke: CHART_TOKENS.series,
          lineWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
        },
      }}
      axis={{
        ...AXIS,
        y: {
          ...AXIS.y,
          labelFormatter: (value: number) =>
            metric === 'revenue' ? `$${formatCompact(value)}` : formatCompact(value),
        },
      }}
      scale={{ y: { nice: true } }}
      tooltip={{
        title: (datum: SeriesPoint) => datum.period,
        items: [
          {
            channel: 'y',
            name: metric === 'revenue' ? 'Revenue' : 'Orders',
            valueFormatter: format,
          },
        ],
      }}
    />
  );
}
