export type UserRole = 'admin' | 'editor' | 'viewer';

export type UserStatus = 'active' | 'invited' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
  phone?: string;
  department?: string;
  notes?: string;
}

/** Fields a user form is allowed to submit; the server owns `id` and `createdAt`. */
export type UserFormValues = Pick<
  User,
  'name' | 'email' | 'role' | 'status' | 'avatar' | 'phone' | 'department' | 'notes'
>;

/** Upsert payload: `id` present means update, absent means create. */
export type UserInput = UserFormValues & Partial<Pick<User, 'id'>>;

/** Editable profile. Browser-local, like the rest of the demo's personal state. */
export interface Profile {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  location: string;
  timezone: string;
  joinedAt: string;
  bio: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  skills: string[];
  avatar?: string;
}

export interface ProfileActivity {
  id: number;
  title: string;
  detail: string;
  time: string;
}

export interface ProfileStats {
  teamMembers: number;
  projects: number;
  contributions: number;
  daysActive: number;
}

export interface ProfileSnapshot {
  profile: Profile;
  activities: ProfileActivity[];
  stats: ProfileStats;
}

export interface TrustedDevice {
  id: number;
  name: string;
  detail: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface LoginRecord {
  id: number;
  device: string;
  location: string;
  ip: string;
  at: string;
  success: boolean;
}

export interface SecuritySnapshot {
  devices: TrustedDevice[];
  sessions: TrustedDevice[];
  logins: LoginRecord[];
  otpUrl: string;
}

/** One day of business activity. The dashboard series are aggregated from these. */
export interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
  visits: number;
}

/** Share of visits, in percent. Turned into counts against the selected date range. */
export interface TrafficSource {
  name: string;
  share: number;
}

export type OrderStatus = 'paid' | 'processing' | 'pending' | 'failed';

export interface Order {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  detail: string;
  priority: TaskPriority;
  done: boolean;
}

export interface CalendarEvent {
  date: string;
  title: string;
  time: string;
  tone: 'primary' | 'success' | 'purple' | 'warning';
}

/** Raw mock output. `dashboard.api.ts` shapes it into a `DashboardView`. */
export interface DashboardSnapshot {
  userCount: number;
  activeUsers: number;
  daily: DailyPoint[];
  trafficSources: TrafficSource[];
  orders: Order[];
  tasks: Task[];
  events: CalendarEvent[];
}

export type TrendDirection = 'up' | 'down' | 'flat';

export interface KpiMetric {
  key: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: { text: string; caption: string; direction: TrendDirection };
}

/** One bucket of the revenue/orders chart. Both measures ride along so the
 *  Revenue/Orders switch is a re-render, not a refetch. */
export interface SeriesPoint {
  period: string;
  revenue: number;
  orders: number;
}

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface DashboardView {
  metrics: KpiMetric[];
  series: SeriesPoint[];
  traffic: { total: number; sources: Array<{ name: string; value: number; share: number }> };
  orders: Order[];
  tasks: Task[];
  events: CalendarEvent[];
}

export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  page: number;
  per_page: number;
}
