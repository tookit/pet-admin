import dayjs, { type Dayjs } from 'dayjs';
import { getProductList, getProductStats } from '@/api/modules/product.api';
import { getQuoteList } from '@/api/modules/quote.api';
import type { ApiQuote } from '@/types/api';

/**
 * Dashboard aggregation over real data: inquiries from `/quotes`, catalog
 * figures from `/products` (design: adminpro-design-docs/dashboard.md).
 * The quote endpoint has no date filter, so we page through and bucket locally;
 * `MAX_PAGES` caps the work — bump it when quote volume outgrows 1,000 rows.
 */

export interface DashboardKpis {
  inquiriesToday: number;
  inquiriesYesterday: number;
  inquiriesThisMonth: number;
  inquiriesLastMonth: number;
  activeProducts: number;
  draftProducts: number;
  totalProducts: number;
}

export interface InquirySeriesPoint {
  period: string; // 'MMM D'
  inquiries: number;
}

export interface TodoItem {
  key: string;
  label: string;
  meta: 'Draft' | 'Inquiries' | 'Media';
  path: string;
  tone: 'gold' | 'mint' | 'gray';
}

export interface DashboardData {
  kpis: DashboardKpis;
  series: InquirySeriesPoint[];
  todos: TodoItem[];
}

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

async function fetchAllQuotes(): Promise<ApiQuote[]> {
  const quotes: ApiQuote[] = [];
  let current = 1;
  let total = Infinity;
  while (quotes.length < total && current <= MAX_PAGES) {
    const response = await getQuoteList({ current, pageSize: PAGE_SIZE });
    total = response.total;
    quotes.push(...response.result);
    current += 1;
  }
  return quotes;
}

function countBetween(quotes: ApiQuote[], start: Dayjs, end: Dayjs): number {
  return quotes.filter((quote) => {
    const date = dayjs(quote.created_at);
    return !date.isBefore(start, 'day') && !date.isAfter(end, 'day');
  }).length;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [stats, quotes] = await Promise.all([getProductStats(), fetchAllQuotes()]);

  const now = dayjs();
  const today = countBetween(quotes, now, now);
  const yesterday = countBetween(quotes, now.subtract(1, 'day'), now.subtract(1, 'day'));
  const monthStart = now.startOf('month');
  const thisMonth = countBetween(quotes, monthStart, now);
  const lastMonth = countBetween(
    quotes,
    monthStart.subtract(1, 'month'),
    monthStart.subtract(1, 'day'),
  );

  // 30-day daily buckets, zero-filled so quiet days still plot on the axis.
  const counts = new Map<string, number>();
  for (const quote of quotes) {
    const key = dayjs(quote.created_at).format('YYYY-MM-DD');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const series: InquirySeriesPoint[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const day = now.subtract(offset, 'day');
    const key = day.format('YYYY-MM-DD');
    series.push({ period: day.format('MMM D'), inquiries: counts.get(key) ?? 0 });
  }

  // Products missing a featured image, scanned from the first catalog page.
  const firstPage = await getProductList({ pageSize: PAGE_SIZE });
  const missingImages = firstPage.result.filter((product) => !product.featured_image).length;

  const todos: TodoItem[] = [
    stats.draft > 0 && {
      key: 'draft',
      label: `${stats.draft} products awaiting review`,
      meta: 'Draft',
      path: '/products',
      tone: 'gold',
    },
    today > 0 && {
      key: 'inquiries',
      label: `${today} new inquiries to reply`,
      meta: 'Inquiries',
      path: '/quotes',
      tone: 'mint',
    },
    missingImages > 0 && {
      key: 'images',
      label: `${missingImages} products missing a featured image`,
      meta: 'Media',
      path: '/products',
      tone: 'gray',
    },
  ].filter((item): item is TodoItem => item !== false);

  return {
    kpis: {
      inquiriesToday: today,
      inquiriesYesterday: yesterday,
      inquiriesThisMonth: thisMonth,
      inquiriesLastMonth: lastMonth,
      activeProducts: stats.active,
      draftProducts: stats.draft,
      totalProducts: stats.total,
    },
    series,
    todos,
  };
}
