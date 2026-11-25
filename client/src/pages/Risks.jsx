import { useState } from 'react';
import useCollection from '../lib/useCollection';
import Modal from '../components/Modal';
import { riskLevel, riskScore } from '../lib/agile';

const blank = { title: '', category: 'Technical', probability: 3, impact: 3, owner: '', mitigation: '', status: 'open' };
const heatColor = (score) => (score >= 15 ? '#fb7185' : score >= 8 ? '#fbbf24' : '#34d399');

export default function Risks() {
  const { items: risks, create, update, remove } = useCollection('risks');
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('active');

  const shown = risks.filter((r) => (filter === 'all' ? true : filter === 'active' ? r.status !== 'closed' : r.status === 'closed')).sort((a, b) => riskScore(b) - riskScore(a));
  const active = risks.filter((r) => r.status !== 'closed');

  const save = async () => {
    const doc = { ...form, probability: Number(form.probability), impact: Number(form.impact) };
    if (form._id) await update(form._id, doc);
    else await create(doc);
    setForm(null);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Risk register</h1>
          <p>Score = probability × impact (1–5 each). Review weekly in stand-up.</p>
        </div>
        <button className="btn" onClick={() => setForm({ ...blank })}>
          + Log risk
        </button>
      </div>

      <div className="grid g3">
        <div className="card">
          <div className="card-head">
            <h3>Heat map</h3>
            <span className="muted small">active risks</span>
          </div>
          <div className="heat">
            {[5, 4, 3, 2, 1].map((p) => (
              <div key={p} style={{ display: 'contents' }}>
                <div className="axis">{p}</div>
                {[1, 2, 3, 4, 5].map((i) => {
                  const n = active.filter((r) => r.probability === p && r.impact === i).length;
                  return (
                    <div key={i} className="cell" style={{ background: heatColor(p * i), opacity: n ? 1 : 0.22 }} title={`P${p} × I${i}`}>
                      {n || ''}
                    </div>
                  );
                })}
              </div>
            ))}
            <div />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="axis">
                {i}
              </div>
            ))}
          </div>
          <div className="row between muted small" style={{ marginTop: 8 }}>
            <span>↑ Probability</span>
            <span>Impact →</span>
          </div>
        </div>

        <div className="card span2">
          <div className="card-head">
            <h3>Risks</h3>
            <div className="tabs">
              {['active', 'closed', 'all'].map((f) => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Risk & mitigation</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>P×I</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const [lvl, cls] = riskLevel(riskScore(r));
                  return (
                    <tr key={r._id}>
                      <td>
                        <b>{r.title}</b>
                        <div className="muted small">↳ {r.mitigation}</div>
                      </td>
                      <td className="muted">{r.category}</td>
                      <td>{r.owner}</td>
                      <td>
                        <span className={`badge ${cls}`}>
                          {r.probability}×{r.impact}={riskScore(r)} {lvl}
                        </span>
                      </td>
                      <td>
                        <select className="input" style={{ padding: '4px 8px', fontSize: 12 }} value={r.status} onChange={(e) => update(r._id, { status: e.target.value })}>
                          <option value="open">open</option>
                          <option value="mitigating">mitigating</option>
                          <option value="closed">closed</option>
                        </select>
                      </td>
                      <td>
                        <button className="icon-btn" onClick={() => setForm({ ...r })}>
                          ✎
                        </button>
                        <button className="icon-btn" onClick={() => window.confirm('Delete risk?') && remove(r._id)}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={!!form}
        title={form?._id ? 'Edit risk' : 'Log a risk'}
        onClose={() => setForm(null)}
        footer={
          <>
            <button className="btn ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="btn" onClick={save} disabled={!form?.title}>
              Save
            </button>
          </>
        }
      >
        {form && (
          <div className="form-grid">
            <label className="field full">
              Risk description
              <input className="input" value={form.title} onChange={set('title')} />
            </label>
            <label className="field">
              Category
              <select className="input" value={form.category} onChange={set('category')}>
                {['Schedule', 'Scope', 'Technical', 'Resource', 'Vendor', 'Quality'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Owner
              <input className="input" value={form.owner} onChange={set('owner')} />
            </label>
            <label className="field">
              Probability: {form.probability}
              <input type="range" min="1" max="5" value={form.probability} onChange={set('probability')} />
            </label>
            <label className="field">
              Impact: {form.impact}
              <input type="range" min="1" max="5" value={form.impact} onChange={set('impact')} />
            </label>
            <label className="field full">
              Mitigation plan
              <textarea className="input" rows="3" value={form.mitigation} onChange={set('mitigation')} />
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
