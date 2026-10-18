import type {
  CalendarEvent,
  DailyPoint,
  DashboardSnapshot,
  LoginRecord,
  Order,
  Profile,
  ProfileActivity,
  ProfileSnapshot,
  SecuritySnapshot,
  Task,
  TrafficSource,
  TrustedDevice,
  User,
  UserInput,
} from '@/types';

let users: User[] = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-10-06',
  },
  {
    id: 2,
    name: 'Taylor Kim',
    email: 'taylor.kim@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2025-11-12',
  },
  {
    id: 3,
    name: 'Sofia Almeida',
    email: 'sofia.almeida@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-01-08',
  },
  {
    id: 4,
    name: 'Priya Raman',
    email: 'priya.raman@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-19',
  },
  {
    id: 5,
    name: 'Emma Larsen',
    email: 'emma.larsen@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-02-03',
  },
  {
    id: 6,
    name: 'Tom Becker',
    email: 'tom.becker@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-02-27',
  },
  {
    id: 7,
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-03-22',
  },
  {
    id: 8,
    name: 'Aisha Bello',
    email: 'aisha.bello@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-04-11',
  },
  {
    id: 9,
    name: 'Daniel Okafor',
    email: 'daniel.okafor@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2026-05-04',
  },
  {
    id: 10,
    name: 'Hana Ito',
    email: 'hana.ito@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-05-30',
  },
  {
    id: 11,
    name: 'Viktor Novak',
    email: 'viktor.novak@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-06-02',
  },
  {
    id: 12,
    name: 'Grace Lim',
    email: 'grace.lim@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-06-25',
  },
  {
    id: 13,
    name: "Liam O'Connor",
    email: 'liam.oconnor@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2026-07-14',
  },
  {
    id: 14,
    name: 'Ruben Ortiz',
    email: 'ruben.ortiz@example.com',
    role: 'viewer',
    status: 'invited',
    createdAt: '2026-07-29',
  },
  {
    id: 15,
    name: 'Chloe Dubois',
    email: 'chloe.dubois@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-08-09',
  },
  {
    id: 16,
    name: 'Nadia Haddad',
    email: 'nadia.haddad@example.com',
    role: 'editor',
    status: 'invited',
    createdAt: '2026-08-26',
  },
  {
    id: 17,
    name: 'Sam Whitfield',
    email: 'sam.whitfield@example.com',
    role: 'viewer',
    status: 'invited',
    createdAt: '2026-09-01',
  },
  {
    id: 18,
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    role: 'viewer',
    status: 'invited',
    createdAt: '2026-09-10',
  },
];

/**
 * Product-level activity for the last two years. Independent of the `users` table
 * above, which is the admin's slice of it.
 *
 * Seeded rather than random: the demo must not reshuffle its own numbers on every
 * reload, and the recent days have to stay put while the user compares ranges.
 *
 * Two years, not one: the dashboard's change figures compare a range against the
 * preceding range of equal length, and a one-year series leaves that previous
 * window empty — a 12-month default range then reports a five-thousand-percent
 * "increase" measured against ten days of data.
 */
function buildDaily(days: number): DailyPoint[] {
  let seed = 20260101;
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const end = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - 1 - index));
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.72 : 1;
    const growth = 1 + index / (days * 1.6);
    const revenue = Math.round(760 * weekend * growth * (0.85 + next() * 0.3));
    const orders = Math.round(revenue / 21);
    return {
      date: date.toISOString().slice(0, 10),
      revenue,
      orders,
      visits: Math.round(orders * (24 + next() * 6)),
    };
  });
}

const DAILY = buildDaily(730);

/** Visits by source, as shares that add up to 100. */
const TRAFFIC_SOURCES: TrafficSource[] = [
  { name: 'Organic Search', share: 40 },
  { name: 'Direct', share: 24 },
  { name: 'Referral', share: 16 },
  { name: 'Social Media', share: 12 },
  { name: 'Email', share: 6 },
  { name: 'Paid Ads', share: 2 },
];

const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const ORDERS: Order[] = (
  [
    { customer: 'Alex Morgan', product: 'MacBook Pro 14"', amount: 1999, status: 'paid' },
    { customer: 'Taylor Kim', product: 'iPhone 15', amount: 999, status: 'processing' },
    { customer: 'Sofia Almeida', product: 'AirPods Pro', amount: 249, status: 'paid' },
    { customer: 'Priya Raman', product: 'Mechanical Keyboard', amount: 129, status: 'pending' },
    { customer: 'Emma Larsen', product: '27" Monitor', amount: 399, status: 'paid' },
    { customer: 'Tom Becker', product: 'USB-C Dock', amount: 179, status: 'failed' },
  ] as const
).map((order, index) => ({ ...order, id: index + 1, createdAt: isoDaysAgo(index) }));

const TASKS: Task[] = [
  {
    id: 1,
    title: 'Review new user registrations',
    detail: '3 pending approvals',
    priority: 'high',
    done: false,
  },
  {
    id: 2,
    title: 'Update product descriptions',
    detail: 'Marketing',
    priority: 'medium',
    done: false,
  },
  {
    id: 3,
    title: 'Approve refund requests',
    detail: '2 requests',
    priority: 'medium',
    done: false,
  },
  {
    id: 4,
    title: 'Prepare monthly report',
    detail: 'Due tomorrow',
    priority: 'low',
    done: true,
  },
  {
    id: 5,
    title: 'Plan Q4 marketing campaign',
    detail: 'Strategy',
    priority: 'low',
    done: false,
  },
];

const EVENTS: CalendarEvent[] = [
  { date: isoDaysAgo(-1), title: 'Team sync meeting', time: '10:00 – 11:00 AM', tone: 'primary' },
  {
    date: isoDaysAgo(-1),
    title: 'Product update review',
    time: '2:00 – 3:00 PM',
    tone: 'success',
  },
  { date: isoDaysAgo(-1), title: 'Design workshop', time: '4:00 – 5:00 PM', tone: 'purple' },
  { date: isoDaysAgo(-3), title: 'Vendor call', time: '11:30 AM – 12:00 PM', tone: 'warning' },
];

const PROFILE: Profile = {
  fullName: 'Wang Qiangshen',
  displayName: 'Wangqiangshen',
  email: 'admin@example.com',
  phone: '+86 138 0000 0000',
  company: 'Acme Corporation',
  jobTitle: 'Administrator',
  location: 'Beijing, China',
  timezone: 'Asia/Shanghai',
  joinedAt: '2023-04-18',
  bio: 'Building better products, together.',
  website: '',
  linkedin: '',
  github: '',
  twitter: '',
  skills: ['Product Management', 'Team Leadership', 'React'],
};

const ACTIVITIES: ProfileActivity[] = [
  {
    id: 1,
    title: 'Logged in successfully',
    detail: 'Chrome on macOS · 192.168.1.1',
    time: '2026-09-19 10:24',
  },
  {
    id: 2,
    title: 'Updated profile information',
    detail: 'Changed your job title',
    time: '2026-09-17 15:15',
  },
  {
    id: 3,
    title: 'Invited a team member',
    detail: 'jordan.lee@example.com',
    time: '2026-09-10 09:02',
  },
];

const DEVICES: TrustedDevice[] = [
  {
    id: 1,
    name: 'MacBook Pro',
    detail: 'macOS · Chrome',
    location: 'Beijing, China',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 2,
    name: 'iPhone 15',
    detail: 'iOS · Safari',
    location: 'Beijing, China',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 3,
    name: 'Windows Desktop',
    detail: 'Windows 11 · Edge',
    location: 'Shanghai, China',
    lastActive: '3 days ago',
    current: false,
  },
];

const LOGINS: LoginRecord[] = [
  {
    device: 'MacBook Pro · Chrome',
    location: 'Beijing, CN',
    ip: '192.168.1.1',
    at: '2026-09-19 10:24',
    success: true,
  },
  {
    device: 'iPhone 15 · Safari',
    location: 'Beijing, CN',
    ip: '192.168.1.24',
    at: '2026-09-19 08:02',
    success: true,
  },
  {
    device: 'Unknown device',
    location: 'Kyiv, UA',
    ip: '203.0.113.9',
    at: '2026-09-18 23:41',
    success: false,
  },
  {
    device: 'Windows Desktop · Edge',
    location: 'Shanghai, CN',
    ip: '198.51.100.7',
    at: '2026-09-16 14:11',
    success: true,
  },
].map((record, index) => ({ ...record, id: index + 1 }));

const wait = <T>(data: T): Promise<T> =>
  new Promise((resolve) => window.setTimeout(() => resolve(data), 250));

export const mockApi = {
  login: (email: string) => wait({ name: email.split('@')[0] || 'Admin', email }),

  register: (name: string, email: string) => wait({ name, email }),

  /** User counts come from the live array, so the tiles cannot disagree with the table. */
  getDashboard: (): Promise<DashboardSnapshot> =>
    wait({
      userCount: users.length,
      activeUsers: users.filter((user) => user.status === 'active').length,
      daily: DAILY,
      trafficSources: TRAFFIC_SOURCES,
      orders: ORDERS,
      tasks: TASKS,
      events: EVENTS,
    }),

  getProfile: (): Promise<ProfileSnapshot> =>
    wait({
      profile: PROFILE,
      activities: ACTIVITIES,
      stats: { teamMembers: 18, projects: 6, contributions: 128, daysActive: 412 },
    }),

  getSecurity: (): Promise<SecuritySnapshot> =>
    wait({
      devices: DEVICES,
      sessions: DEVICES,
      logins: LOGINS,
      otpUrl: 'otpauth://totp/AdminPro:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AdminPro',
    }),

  getUsers: () => wait([...users]),

  saveUser: (user: UserInput) => {
    const existing = user.id ? users.find((item) => item.id === user.id) : undefined;
    if (existing) {
      Object.assign(existing, user);
    } else {
      const nextId = users.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const nextUser: User = {
        ...user,
        id: nextId,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      users = [nextUser, ...users];
    }
    return wait(undefined);
  },

  deleteUser: (id: number) => {
    users = users.filter((user) => user.id !== id);
    return wait(undefined);
  },
};
