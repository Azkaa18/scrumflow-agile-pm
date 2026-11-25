import { PRIORITY, TYPE_ICON } from '../lib/agile';
import { initials } from '../lib/format';

export default function Ticket({ story, member, onOpen, draggable, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      className={`ticket ${dragging ? 'dragging' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
    >
      <div className="row between">
        <span className="key">
          <span className={`type-${story.type}`}>{TYPE_ICON[story.type]}</span> {story.key}
        </span>
        <span className={`badge ${PRIORITY[story.priority]}`}>{story.priority}</span>
      </div>
      <div className="t-title">{story.title}</div>
      <div className="t-foot">
        <span className="muted small">{story.epic}</span>
        <div className="row" style={{ gap: 6 }}>
          <span className="pts">{story.points} pt</span>
          {member ? (
            <span className="mini-avatar" style={{ background: member.color || 'var(--primary)' }} title={member.name}>
              {initials(member.name)}
            </span>
          ) : (
            <span className="mini-avatar" style={{ background: 'var(--hover)', color: 'var(--muted)' }} title="Unassigned">
              ?
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
