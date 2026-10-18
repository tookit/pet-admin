import { Pie } from '@ant-design/plots';
import { theme } from 'antd';
import { useDarkMode } from '@/contexts/SettingsContext';
import { CHART_TOKENS, NO_ENTRY_ANIMATION } from '@/constants/app';
import { formatCompact } from '@/api/modules/dashboard.api';
import type { DashboardView } from '@/types';

type Source = DashboardView['traffic']['sources'][number];

/**
 * Categorical chart: here the colour carries identity, so the slots come from the
 * validated palette in fixed order rather than from the brand hue. The legend is
 * rendered as text beside the ring — colour is never the only way to read a source.
 */
export default function TrafficSources({ sources, total }: { sources: Source[]; total: number }) {
  const { token } = theme.useToken();
  const palette = CHART_TOKENS.categorical[useDarkMode() ? 'dark' : 'light'];
  return (
    <div className="donut-layout">
      <div className="donut-canvas">
        <Pie
          {...NO_ENTRY_ANIMATION}
          data={sources}
          angleField="value"
          colorField="name"
          innerRadius={0.68}
          radius={0.92}
          height={240}
          legend={false}
          label={false}
          scale={{ color: { range: [...palette] } }}
          style={{ stroke: token.colorBgContainer, lineWidth: 2 }}
          tooltip={{
            items: [
              {
                channel: 'y',
                valueFormatter: (value: number) => `${formatCompact(value)} visits`,
              },
            ],
          }}
        />
        <div className="donut-center">
          <strong>{formatCompact(total)}</strong>
          <span>Total Visits</span>
        </div>
      </div>
      <ul className="donut-legend">
        {sources.map((source, index) => (
          <li key={source.name}>
            <span className="donut-dot" style={{ background: palette[index] }} />
            <span className="donut-name">{source.name}</span>
            <span className="donut-share">{source.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
