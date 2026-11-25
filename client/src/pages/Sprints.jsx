import { useState } from 'react';
import useCollection from '../lib/useCollection';
import Modal from '../components/Modal';
import { completeSprint, startSprint } from '../lib/agile';
import { date } from '../lib/format';

export default function Sprints() {
  const { items: sprints, create, reload } = useCollection('sprints');
  const { items: stories, reload: reloadStories } = useCollection('stories');
  const { items: members } = useCollection('members');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const capacity = members.reduce((a, m) => a + m.capacity, 0);
  const run = async (fn) => {
    setError('');
    try {
      await fn();
      await Promise.all([reload(), reloadStories()]);
    } catch (e) {
      setError(e.message);
    }
  };

  const ordered = [...sprints].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sprints</h1>
          <p>Team capacity: {capacity} pts per sprint.</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            const start = new Date();
            start.setDate(start.getDate() + 14);
            const end = new Date(start);
            end.setDate(end.getDate() + 14);
            setForm({ name: `Sprint ${20 + sprints.length + 1}`, goal: '', startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) });
          }}
        >
          + Plan sprint
        </button>
      </div>
      {error && (
        <div className="badge bad" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div className="stack">
        {ordered.map((sp) => {
          const mine = stories.filter((s) => s.sprint === sp._id);
          const pts = sp.status === 'completed' ? sp.committedPoints : mine.reduce((a, s) => a + s.points, 0);
          const donePts = sp.status === 'completed' ? sp.completedPoints : mine.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);
          const load = capacity ? Math.round((pts / capacity) * 100) : 0;
          return (
            <div key={sp._id} className={`card sprint-card ${sp.status}`}>
              <div className="row between wrap">
                <div>
                  <h3 style={{ fontSize: 18 }}>
                    {sp.name} <span className={`badge ${sp.status === 'active' ? 'pri' : sp.status === 'completed' ? 'ok' : ''}`}>{sp.status}</span>
                  </h3>
                  <div className="muted">🎯 {sp.goal || 'No goal set'}</div>
                  <div className="muted small">
                    {date(sp.startDate)} → {date(sp.endDate)}
                  </div>
                </div>
                <div className="row">
                  <div style={{ textAlign: 'right' }}>
                    <div className="muted small">{sp.status === 'completed' ? 'Delivered / committed' : 'Done / planned'}</div>
                    <b style={{ fontSize: 20 }}>
                      {donePts} / {pts} pts
                    </b>
                  </div>
                  {sp.status === 'planned' && (
                    <button className="btn" onClick={() => run(() => startSprint(sp._id))}>
                      ▶ Start sprint
                    </button>
                  )}
                  {sp.status === 'active' && (
                    <button className="btn soft" onClick={() => window.confirm('Complete sprint? Unfinished items return to the backlog.') && run(() => completeSprint(sp._id))}>
                      ✓ Complete sprint
                    </button>
                  )}
                </div>
              </div>
              {sp.status !== 'completed' && (
                <div style={{ marginTop: 14 }}>
                  <div className="row between small">
                    <span className="muted">Capacity load</span>
                    <b style={{ color: load > 100 ? 'var(--danger)' : load > 85 ? 'var(--warn)' : 'var(--ok)' }}>{load}%</b>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${Math.min(100, load)}%`, background: load > 100 ? 'var(--danger)' : undefined }} />
                  </div>
                  {load > 100 && <div className="small" style={{ color: 'var(--danger)', marginTop: 6 }}>Over-committed — move items back to the backlog.</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={!!form}
        title="Plan a new sprint"
        onClose={() => setForm(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button
              className="btn"
              onClick={async () => {
                await create({ ...form, status: 'planned', startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() });
                setForm(null);
              }}
            >
              Create sprint
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
            <label className="field full">
              Sprint goal
              <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </label>
            <label className="field">
              Start
              <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label className="field">
              End
              <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
