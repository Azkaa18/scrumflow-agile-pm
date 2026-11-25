import { daysAgo } from '../lib/format';

export const STORAGE_KEY = 'scrumflow-demo-v1';

const members = [
  { _id: 'm1', name: 'Ali Raza', role: 'Frontend', capacity: 13, color: '#a78bfa' },
  { _id: 'm2', name: 'Zara Malik', role: 'Backend', capacity: 13, color: '#f472b6' },
  { _id: 'm3', name: 'Omar Shah', role: 'Mobile', capacity: 10, color: '#34d399' },
  { _id: 'm4', name: 'Hina Iqbal', role: 'QA', capacity: 8, color: '#fbbf24' },
  { _id: 'm5', name: 'Bilal Ahmed', role: 'DevOps', capacity: 8, color: '#fb7185' },
];

const sprints = [
  { _id: 'sp1', name: 'Sprint 21', goal: 'Driver onboarding flow', startDate: daysAgo(42), endDate: daysAgo(28), status: 'completed', committedPoints: 34, completedPoints: 29 },
  { _id: 'sp2', name: 'Sprint 22', goal: 'Payments & invoicing', startDate: daysAgo(28), endDate: daysAgo(14), status: 'completed', committedPoints: 38, completedPoints: 36 },
  { _id: 'sp3', name: 'Sprint 23', goal: 'Notifications & in-app chat MVP', startDate: daysAgo(7), endDate: daysAgo(-7), status: 'active', committedPoints: 40 },
  { _id: 'sp4', name: 'Sprint 24', goal: 'Analytics dashboard v1', startDate: daysAgo(-7), endDate: daysAgo(-21), status: 'planned' },
];

const S = (key, title, type, points, priority, status, sprint, assignee, epic, ac = [], doneDaysAgo) => ({
  _id: key,
  key,
  title,
  type,
  points,
  priority,
  status,
  sprint,
  assignee,
  epic,
  acceptanceCriteria: ac,
  description: '',
  createdAt: daysAgo(20),
  doneAt: doneDaysAgo !== undefined ? daysAgo(doneDaysAgo) : undefined,
});

const stories = [
  S('SF-131', 'Push notifications for order status', 'story', 8, 'high', 'done', 'sp3', 'm2', 'Notifications', ['Notify on accepted / shipped / delivered', 'User can mute per category'], 5),
  S('SF-132', 'Notification centre screen', 'story', 5, 'medium', 'done', 'sp3', 'm3', 'Notifications', ['List grouped by day', 'Mark all as read'], 3),
  S('SF-133', 'Chat socket service', 'story', 8, 'critical', 'inprogress', 'sp3', 'm2', 'Chat', ['Messages delivered < 1s', 'Reconnect on network drop']),
  S('SF-134', 'Chat UI — conversation list', 'story', 5, 'high', 'review', 'sp3', 'm1', 'Chat', ['Unread badge', 'Search conversations']),
  S('SF-135', 'Chat UI — message thread (mobile)', 'story', 5, 'high', 'inprogress', 'sp3', 'm3', 'Chat'),
  S('SF-136', 'Fix: badge count not resetting', 'bug', 2, 'medium', 'done', 'sp3', 'm1', 'Notifications', [], 1),
  S('SF-137', 'E2E tests for notification flow', 'task', 3, 'medium', 'todo', 'sp3', 'm4', 'Notifications'),
  S('SF-138', 'Configure FCM & APNs keys on staging', 'task', 2, 'high', 'done', 'sp3', 'm5', 'Notifications', [], 6),
  S('SF-139', 'Spike: evaluate message storage options', 'spike', 2, 'low', 'todo', 'sp3', 'm2', 'Chat'),
  S('SF-140', 'Analytics: revenue overview widget', 'story', 5, 'medium', 'backlog', 'sp4', 'm1', 'Analytics', ['Daily / weekly / monthly toggle']),
  S('SF-141', 'Analytics: export report to CSV', 'story', 3, 'low', 'backlog', 'sp4', 'm2', 'Analytics'),
  S('SF-142', 'Dark mode for mobile app', 'story', 5, 'low', 'backlog', undefined, undefined, 'UX'),
  S('SF-143', 'Fix: crash on Android 10 when uploading avatar', 'bug', 3, 'critical', 'backlog', undefined, undefined, 'Stability'),
  S('SF-144', 'Rate limiting on public API', 'story', 3, 'high', 'backlog', undefined, undefined, 'Security', ['429 after 100 req/min per IP']),
  S('SF-145', 'Onboarding tooltips for new users', 'story', 2, 'medium', 'backlog', undefined, undefined, 'UX'),
];

const risks = [
  { _id: 'r1', title: 'Apple App Store review may delay chat release', category: 'Schedule', probability: 3, impact: 4, owner: 'PM', mitigation: 'Submit build 5 working days before launch; prepare review notes', status: 'mitigating', createdAt: daysAgo(10) },
  { _id: 'r2', title: 'Socket server may not scale beyond 5k concurrent users', category: 'Technical', probability: 2, impact: 5, owner: 'Zara Malik', mitigation: 'Load-test on staging; plan Redis adapter', status: 'open', createdAt: daysAgo(9) },
  { _id: 'r3', title: 'QA capacity reduced (leave in week 2)', category: 'Resource', probability: 4, impact: 3, owner: 'PM', mitigation: 'Developers pair on test cases; automate smoke tests', status: 'open', createdAt: daysAgo(6) },
  { _id: 'r4', title: 'SMS vendor contract renewal pending', category: 'Vendor', probability: 2, impact: 2, owner: 'Operations', mitigation: 'Shortlist backup vendor', status: 'closed', createdAt: daysAgo(20) },
  { _id: 'r5', title: 'Client may add new reporting scope mid-sprint', category: 'Scope', probability: 4, impact: 4, owner: 'PM', mitigation: 'Route through change request; park in Sprint 24 backlog', status: 'open', createdAt: daysAgo(3) },
];

export const seed = {
  users: [{ _id: 'u1', name: 'Azka Ghafoor', email: 'pm@scrumflow.app', role: 'admin' }],
  members,
  sprints,
  stories,
  risks,
};
