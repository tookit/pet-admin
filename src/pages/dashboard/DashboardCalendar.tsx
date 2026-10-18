import { Badge, Calendar, Empty } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { ACCENT_COLORS } from '@/constants/app';
import type { CalendarEvent } from '@/types';

/** Mini month view; the events for the selected day sit below it. */
export default function DashboardCalendar({ events }: { events: CalendarEvent[] }) {
  const [selected, setSelected] = useState<Dayjs>(() => dayjs(events[0]?.date));
  const onDate = (date: string) => events.filter((event) => event.date === date);
  const today = onDate(selected.format('YYYY-MM-DD'));

  return (
    <div className="mini-calendar">
      <Calendar
        fullscreen={false}
        value={selected}
        onSelect={setSelected}
        cellRender={(date, info) => {
          if (info.type !== 'date') return info.originNode;
          const dayEvents = onDate(date.format('YYYY-MM-DD'));
          return (
            <span className="calendar-cell">
              {date.date()}
              {dayEvents.length > 0 && (
                <i
                  className="calendar-dot"
                  style={{ background: ACCENT_COLORS[dayEvents[0].tone] }}
                />
              )}
            </span>
          );
        }}
      />
      <ul className="calendar-events">
        {today.map((event) => (
          <li key={event.title}>
            <Badge color={ACCENT_COLORS[event.tone]} />
            <span className="calendar-event-title">{event.title}</span>
            <span className="calendar-event-time">{event.time}</span>
          </li>
        ))}
        {today.length === 0 && (
          <li>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No events on this day" />
          </li>
        )}
      </ul>
    </div>
  );
}
