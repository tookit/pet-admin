import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import type { ReactNode } from 'react';
import { ACCENT_COLORS, accentTint, type AccentName } from '@/constants/app';

export interface MetricItem {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: AccentName;
  prefix?: string;
  suffix?: string;
  detail?: string;
  /** Right-hand side of the tile: a change figure plus what it is measured against. */
  trend?: { text: string; caption?: string; direction?: 'up' | 'down' | 'flat' };
}

/** KPI tiles: 4-up on desktop, 2-up on tablet, single column on mobile (design system §14). */
export default function MetricsRow({ items }: { items: MetricItem[] }) {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col xs={24} md={12} xl={6} key={item.label}>
          <Card className="metric-card" styles={{ body: { padding: 20 } }}>
            <div className="metric-inner">
              <span
                className="metric-icon"
                style={{
                  background: accentTint(item.tone ?? 'primary'),
                  color: ACCENT_COLORS[item.tone ?? 'primary'],
                }}
              >
                {item.icon}
              </span>
              <div className="metric-text">
                <Statistic
                  title={item.label}
                  value={item.value}
                  prefix={item.prefix}
                  suffix={item.suffix}
                  precision={item.suffix === '%' ? 1 : 0}
                />
                {item.detail && <span className="metric-detail">{item.detail}</span>}
              </div>
              {item.trend && (
                <div className={`metric-trend metric-trend-${item.trend.direction ?? 'flat'}`}>
                  <span className="metric-trend-value">
                    {item.trend.direction === 'up' && <ArrowUpOutlined />}
                    {item.trend.direction === 'down' && <ArrowDownOutlined />}
                    {item.trend.text}
                  </span>
                  {item.trend.caption && (
                    <Typography.Text type="secondary" className="metric-trend-caption">
                      {item.trend.caption}
                    </Typography.Text>
                  )}
                </div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
