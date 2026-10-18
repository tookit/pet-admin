import { Area } from '@ant-design/plots';
import { CHART_TOKENS, NO_ENTRY_ANIMATION } from '@/constants/app';
import type { InquirySeriesPoint } from '@/api/modules/dashboard.api';

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
 * Daily inquiry counts for the last 30 days. One measure, one hue: the brand
 * Mint Teal 700 (`CHART_TOKENS.series`), area fill at the brand gradient
 * opacity — mirrors the design mockup in adminpro-design-docs/dashboard.md.
 */
export default function InquiryTrend({ data }: { data: InquirySeriesPoint[] }) {
  return (
    <Area
      {...NO_ENTRY_ANIMATION}
      data={data}
      xField="period"
      yField="inquiries"
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
          labelFormatter: (value: number) => `${value}`,
        },
      }}
      scale={{ y: { nice: true } }}
      tooltip={{
        title: (datum: InquirySeriesPoint) => datum.period,
        items: [
          {
            channel: 'y',
            name: 'Inquiries',
            valueFormatter: (value: number) => `${value}`,
          },
        ],
      }}
    />
  );
}
