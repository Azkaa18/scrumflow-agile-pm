/**
 * Data layer with two modes:
 *  - API mode:  set VITE_API_URL (e.g. http://localhost:5000) and every call goes to the Express backend.
 *  - Demo mode: no VITE_API_URL → data lives in localStorage, seeded with sample data.
 *    This lets the frontend be deployed on its own (GitHub Pages / Vercel) as a live demo.
 */
import { STORAGE_KEY, seed } from '../data/seed';

export const API_URL = import.meta.env.VITE_API_URL || '';
export const DEMO = !API_URL;

const clone = (v) => JSON.parse(JSON.stringify(v));

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable */
  }
  return clone(seed);
}

let db = loadDb();

export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable — data stays in memory */
  }
}

export function getDb() {
  return db;
}

export function resetDemo() {
  db = clone(seed);
  saveDb();
}

export const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export async function http(path, { method = 'GET', body } = {}) {
  let token = null;
  try {
    token = localStorage.getItem(`${STORAGE_KEY}-token`);
  } catch {
    /* ignore */
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const delay = (v) => new Promise((r) => setTimeout(() => r(clone(v)), 120));

export const api = {
  list(resource) {
    if (!DEMO) return http(`/api/${resource}`);
    return delay(db[resource] || []);
  },
  create(resource, doc) {
    if (!DEMO) return http(`/api/${resource}`, { method: 'POST', body: doc });
    const item = { _id: uid(), createdAt: new Date().toISOString(), ...doc };
    db[resource] = [item, ...(db[resource] || [])];
    saveDb();
    return delay(item);
  },
  update(resource, id, patch) {
    if (!DEMO) return http(`/api/${resource}/${id}`, { method: 'PUT', body: patch });
    db[resource] = db[resource].map((x) => (x._id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x));
    saveDb();
    return delay(db[resource].find((x) => x._id === id));
  },
  remove(resource, id) {
    if (!DEMO) return http(`/api/${resource}/${id}`, { method: 'DELETE' });
    db[resource] = db[resource].filter((x) => x._id !== id);
    saveDb();
    return delay({ _id: id });
  },
  async login(email, password) {
    if (!DEMO) {
      const res = await http('/api/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem(`${STORAGE_KEY}-token`, res.token);
      return res.user;
    }
    const user = (db.users || []).find((u) => u.email === email) || db.users?.[0];
    if (!password || password.length < 4) throw new Error('Password must be at least 4 characters');
    return delay(user);
  },
  logout() {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-token`);
    } catch {
      /* ignore */
    }
  },
};
