import { useState } from 'react';
import useCollection from '../lib/useCollection';
import StoryModal, { blankStory } from '../components/StoryModal';
import { PRIORITY, TYPE_ICON } from '../lib/agile';

const order = { critical: 0, high: 1, medium: 2, low: 3 };

export default function Backlog() {
  const { items: stories, create, update, remove } = useCollection('stories');
  const { items: sprints } = useCollection('sprints');
  const { items: members } = useCollection('members');
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');

  const openSprints = sprints.filter((s) => s.status !== 'completed');
  const match = (s) => (type === 'all' || s.type === type) && `${s.key} ${s.title} ${s.epic}`.toLowerCase().includes(q.toLowerCase());
  const groups = [
    ...openSprints.map((sp) => ({ id: sp._id, title: sp.name, sub: sp.goal, status: sp.status, items: stories.filter((s) => s.sprint === sp._id && match(s)) })),
    { id: '', title: 'Product backlog', sub: 'Groomed and prioritised, not yet planned', items: stories.filter((s) => !s.sprint && match(s)).sort((a, b) => order[a.priority] - order[b.priority]) },
  ];

  const save = async (s) => {
    if (s._id) await update(s._id, s);
    else await create({ ...s, key: `SF-${146 + stories.length}` });
    setOpen(null);
  };

  const memberName = (id) => members.find((m) => m._id === id)?.name || 'Unassigned';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Backlog</h1>
          <p>Groom user stories, estimate in points and plan them into sprints.</p>
        </div>
        <div className="row">
          <input className="input" style={{ width: 220 }} placeholder="Search backlog…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" style={{ width: 120 }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="story">Stories</option>
            <option value="bug">Bugs</option>
            <option value="task">Tasks</option>
            <option value="spike">Spikes</option>
          </select>
          <button className="btn" onClick={() => setOpen({ ...blankStory })}>
            + Create item
          </button>
        </div>
      </div>

      <div className="stack">
        {groups.map((g) => {
          const pts = g.items.reduce((a, s) => a + s.points, 0);
          return (
            <div className="card" key={g.id || 'backlog'}>
              <div className="card-head">
                <div>
                  <h3>
                    {g.title} {g.status && <span className={`badge ${g.status === 'active' ? 'pri' : ''}`}>{g.status}</span>}
                  </h3>
                  <div className="muted small">{g.sub}</div>
                </div>
                <span className="muted small">
                  {g.items.length} items · <b style={{ color: 'var(--text)' }}>{pts} pts</b>
                </span>
              </div>
              <table className="table">
                <tbody>
                  {g.items.map((s) => (
                    <tr key={s._id}>
                      <td style={{ width: 90 }}>
                        <span className="key">
                          <span className={`type-${s.type}`}>{TYPE_ICON[s.type]}</span> {s.key}
                        </span>
                      </td>
                      <td style={{ cursor: 'pointer' }} onClick={() => setOpen(s)}>
                        <b>{s.title}</b>
                        {s.acceptanceCriteria?.length > 0 && <div className="muted small">✓ {s.acceptanceCriteria.length} acceptance criteria</div>}
                      </td>
                      <td className="muted small">{s.epic}</td>
                      <td>
                        <span className={`badge ${PRIORITY[s.priority]}`}>{s.priority}</span>
                      </td>
                      <td className="muted small">{memberName(s.assignee)}</td>
                      <td>
                        <span className="pts">{s.points}</span>
                      </td>
                      <td style={{ width: 170 }}>
                        <select
                          className="input"
                          style={{ padding: '5px 8px', fontSize: 12 }}
                          value={s.sprint || ''}
                          onChange={(e) => update(s._id, { sprint: e.target.value || null, status: e.target.value ? s.status : 'backlog' })}
                        >
                          <option value="">Move to backlog</option>
                          {openSprints.map((sp) => (
                            <option key={sp._id} value={sp._id}>
                              → {sp.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {g.items.length === 0 && <div className="empty">Nothing here yet.</div>}
            </div>
          );
        })}
      </div>

      {open && (
        <StoryModal
          story={open}
          members={members}
          sprints={sprints}
          onClose={() => setOpen(null)}
          onSave={save}
          onDelete={async (id) => {
            await remove(id);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}
