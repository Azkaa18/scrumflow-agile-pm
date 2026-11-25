import { useState } from 'react';
import useCollection from '../lib/useCollection';
import Ticket from '../components/Ticket';
import StoryModal from '../components/StoryModal';
import { COLUMNS } from '../lib/agile';

export default function Board() {
  const { items: sprints } = useCollection('sprints');
  const { items: stories, update, remove } = useCollection('stories');
  const { items: members } = useCollection('members');
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);
  const [who, setWho] = useState('all');
  const [open, setOpen] = useState(null);

  const active = sprints.find((s) => s.status === 'active');
  const inSprint = stories.filter((s) => active && s.sprint === active._id && (who === 'all' || s.assignee === who));
  const memberOf = (id) => members.find((m) => m._id === id);

  const drop = async (status) => {
    setOver(null);
    const s = stories.find((x) => x._id === dragId);
    if (s && s.status !== status) await update(s._id, { status, doneAt: status === 'done' ? new Date().toISOString() : undefined });
    setDragId(null);
  };

  if (!active) return <div className="empty card">No active sprint. Start one from the Sprints page.</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sprint board</h1>
          <p>
            {active.name} — drag cards between columns to update status.
          </p>
        </div>
        <div className="tabs">
          <button className={who === 'all' ? 'active' : ''} onClick={() => setWho('all')}>
            Everyone
          </button>
          {members.map((m) => (
            <button key={m._id} className={who === m._id ? 'active' : ''} onClick={() => setWho(m._id)}>
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const cards = inSprint.filter((s) => s.status === col.id);
          return (
            <div
              key={col.id}
              className={`column ${over === col.id ? 'over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => drop(col.id)}
            >
              <div className="column-head">
                <span>{col.label}</span>
                <span className="count">
                  {cards.length} · {cards.reduce((a, s) => a + s.points, 0)} pts
                </span>
              </div>
              {cards.map((s) => (
                <Ticket
                  key={s._id}
                  story={s}
                  member={memberOf(s.assignee)}
                  draggable
                  dragging={dragId === s._id}
                  onDragStart={() => setDragId(s._id)}
                  onDragEnd={() => setDragId(null)}
                  onOpen={() => setOpen(s)}
                />
              ))}
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
          onSave={async (s) => {
            await update(s._id, s);
            setOpen(null);
          }}
          onDelete={async (id) => {
            await remove(id);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}
