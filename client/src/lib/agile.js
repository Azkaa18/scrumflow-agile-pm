import { DEMO, getDb, http, saveDb } from './api';

export const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'inprogress', label: 'In progress' },
  { id: 'review', label: 'In review' },
  { id: 'done', label: 'Done' },
];

export const PRIORITY = { low: '', medium: 'pri', high: 'warn', critical: 'bad' };
export const TYPE_ICON = { story: '◆', bug: '●', task: '■', spike: '▲' };
export const POINTS = [0, 1, 2, 3, 5, 8, 13];

export const riskScore = (r) => r.probability * r.impact;
export const riskLevel = (score) => (score >= 15 ? ['High', 'bad'] : score >= 8 ? ['Medium', 'warn'] : ['Low', 'ok']);

export async function startSprint(id) {
  if (!DEMO) return http(`/api/sprints/${id}/start`, { method: 'POST' });
  const db = getDb();
  if (db.sprints.some((s) => s.status === 'active')) throw new Error('Another sprint is already active — complete it first.');
  const sp = db.sprints.find((s) => s._id === id);
  const mine = db.stories.filter((s) => s.sprint === id);
  mine.forEach((s) => {
    if (s.status === 'backlog') s.status = 'todo';
  });
  Object.assign(sp, { status: 'active', committedPoints: mine.reduce((a, s) => a + s.points, 0), startDate: new Date().toISOString() });
  saveDb();
  return sp;
}

export async function completeSprint(id) {
  if (!DEMO) return http(`/api/sprints/${id}/complete`, { method: 'POST' });
  const db = getDb();
  const sp = db.sprints.find((s) => s._id === id);
  const mine = db.stories.filter((s) => s.sprint === id);
  sp.completedPoints = mine.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);
  sp.status = 'completed';
  sp.endDate = new Date().toISOString();
  mine.filter((s) => s.status !== 'done').forEach((s) => {
    s.status = 'backlog';
    s.sprint = undefined;
  });
  saveDb();
  return sp;
}

/** Ideal vs actual remaining points across the sprint's days. */
export function burndown(sprint, stories) {
  if (!sprint) return { labels: [], ideal: [], actual: [] };
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const days = Math.max(1, Math.round((end - start) / 86400000));
  const total = stories.reduce((a, s) => a + s.points, 0);
  const labels = [];
  const ideal = [];
  const actual = [];
  const today = new Date();
  for (let i = 0; i <= days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    labels.push(i % 2 === 0 ? `D${i}` : '');
    ideal.push(Math.round(total - (total * i) / days));
    if (d <= today) {
      const done = stories.filter((s) => s.status === 'done' && s.doneAt && new Date(s.doneAt) <= d).reduce((a, s) => a + s.points, 0);
      actual.push(total - done);
    }
  }
  return { labels, ideal, actual };
}
