import { useState } from 'react';
import useCollection from '../lib/useCollection';
import Modal from '../components/Modal';
import { initials } from '../lib/format';

const roles = ['Frontend', 'Backend', 'Mobile', 'QA', 'Design', 'DevOps', 'PM'];
const colors = ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#2dd4bf'];

export default function Team() {
  const { items: members, create, update, remove } = useCollection('members');
  const { items: stories } = useCollection('stories');
  const { items: sprints } = useCollection('sprints');
  const [form, setForm] = useState(null);

  const active = sprints.find((s) => s.status === 'active');
  const load = (m) => {
    const mine = stories.filter((s) => active && s.sprint === active._id && s.assignee === m._id);
    return {
      assigned: mine.reduce((a, s) => a + s.points, 0),
      done: mine.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0),
      items: mine.length,
    };
  };

  const save = async () => {
    const doc = { ...form, capacity: Number(form.capacity) };
    if (form._id) await update(form._id, doc);
    else await create({ ...doc, color: colors[members.length % colors.length] });
    setForm(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Team & capacity</h1>
          <p>Workload for {active?.name || 'the current sprint'} against each person’s capacity.</p>
        </div>
        <button className="btn" onClick={() => setForm({ name: '', email: '', role: 'Frontend', capacity: 10 })}>
          + Add member
        </button>
      </div>
      <div className="grid g3">
        {members.map((m) => {
          const l = load(m);
          const pct = m.capacity ? Math.round((l.assigned / m.capacity) * 100) : 0;
          const tone = pct > 100 ? 'var(--danger)' : pct > 85 ? 'var(--warn)' : 'var(--ok)';
          return (
            <div className="card" key={m._id}>
              <div className="row between">
                <div className="row">
                  <span className="mini-avatar" style={{ width: 42, height: 42, fontSize: 14, background: m.color }}>
                    {initials(m.name)}
                  </span>
                  <div>
                    <b>{m.name}</b>
                    <div className="muted small">{m.role}</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 2 }}>
                  <button className="icon-btn" onClick={() => setForm({ ...m })}>
                    ✎
                  </button>
                  <button className="icon-btn" onClick={() => window.confirm(`Remove ${m.name}?`) && remove(m._id)}>
                    🗑
                  </button>
                </div>
              </div>
              <div className="row between small" style={{ marginTop: 18 }}>
                <span className="muted">Load</span>
                <b style={{ color: tone }}>
                  {l.assigned} / {m.capacity} pts ({pct}%)
                </b>
              </div>
              <div className="progress">
                <span style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
              </div>
              <div className="grid g3" style={{ marginTop: 14, gap: 8 }}>
                <div>
                  <div className="muted small">Items</div>
                  <b>{l.items}</b>
                </div>
                <div>
                  <div className="muted small">Done</div>
                  <b>{l.done} pts</b>
                </div>
                <div>
                  <div className="muted small">Free</div>
                  <b>{Math.max(0, m.capacity - l.assigned)} pts</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!form}
        title={form?._id ? 'Edit member' : 'Add team member'}
        onClose={() => setForm(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="btn" onClick={save} disabled={!form?.name}>
              Save
            </button>
          </>
        }
      >
        {form && (
          <div className="form-grid">
            <label className="field full">
              Name
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              Role
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Capacity (pts / sprint)
              <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
