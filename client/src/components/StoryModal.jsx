import { useState } from 'react';
import Modal from './Modal';
import { POINTS } from '../lib/agile';

export const blankStory = {
  title: '',
  description: '',
  type: 'story',
  points: 3,
  priority: 'medium',
  status: 'backlog',
  epic: '',
  acceptanceCriteria: [],
  assignee: '',
  sprint: '',
};

export default function StoryModal({ story, members, sprints, onClose, onSave, onDelete }) {
  const [s, setS] = useState(story);
  const [ac, setAc] = useState('');
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const addAc = () => {
    if (!ac.trim()) return;
    setS({ ...s, acceptanceCriteria: [...(s.acceptanceCriteria || []), ac.trim()] });
    setAc('');
  };

  const save = () => {
    if (!s.title.trim()) return;
    onSave({ ...s, points: Number(s.points), assignee: s.assignee || null, sprint: s.sprint || null });
  };

  return (
    <Modal
      open
      width={620}
      title={s._id ? `${s.key || ''} · Edit item` : 'New backlog item'}
      onClose={onClose}
      footer={
        <>
          {s._id && onDelete && (
            <button className="btn danger" style={{ marginRight: 'auto' }} onClick={() => onDelete(s._id)}>
              Delete
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label className="field full">
          Title (user story)
          <input className="input" placeholder="As a <user>, I want <goal> so that <benefit>" value={s.title} onChange={set('title')} />
        </label>
        <label className="field full">
          Description
          <textarea className="input" rows="3" value={s.description} onChange={set('description')} />
        </label>
        <label className="field">
          Type
          <select className="input" value={s.type} onChange={set('type')}>
            {['story', 'bug', 'task', 'spike'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Priority
          <select className="input" value={s.priority} onChange={set('priority')}>
            {['low', 'medium', 'high', 'critical'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Story points
          <select className="input" value={s.points} onChange={set('points')}>
            {POINTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Epic
          <input className="input" value={s.epic} onChange={set('epic')} />
        </label>
        <label className="field">
          Assignee
          <select className="input" value={s.assignee || ''} onChange={set('assignee')}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} — {m.role}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Sprint
          <select className="input" value={s.sprint || ''} onChange={set('sprint')}>
            <option value="">Product backlog</option>
            {sprints
              .filter((sp) => sp.status !== 'completed')
              .map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.name} ({sp.status})
                </option>
              ))}
          </select>
        </label>
        <div className="field full">
          Acceptance criteria
          <ul className="ac-list">
            {(s.acceptanceCriteria || []).map((c, i) => (
              <li key={c + i}>
                {c}{' '}
                <button className="icon-btn" onClick={() => setS({ ...s, acceptanceCriteria: s.acceptanceCriteria.filter((_, j) => j !== i) })}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="row">
            <input
              className="input"
              placeholder="Given… when… then…"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAc())}
            />
            <button className="btn soft" onClick={addAc}>
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
