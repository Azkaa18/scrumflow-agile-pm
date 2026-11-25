import useCollection from '../lib/useCollection';
import { BarChart, Donut } from '../components/Charts';
import { riskLevel, riskScore } from '../lib/agile';
import { date } from '../lib/format';

export default function Reports() {
  const { items: sprints } = useCollection('sprints');
  const { items: stories } = useCollection('stories');
  const { items: risks } = useCollection('risks');

  const completed = sprints.filter((s) => s.status === 'completed').sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const active = sprints.find((s) => s.status === 'active');
  const inSprint = stories.filter((s) => active && s.sprint === active._id);
  const total = inSprint.reduce((a, s) => a + s.points, 0);
  const done = inSprint.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);

  const elapsed = active ? Math.min(1, (new Date() - new Date(active.startDate)) / (new Date(active.endDate) - new Date(active.startDate))) : 0;
  const progress = total ? done / total : 0;
  const highRisks = risks.filter((r) => r.status !== 'closed' && riskScore(r) >= 15).length;
  const rag = progress + 0.1 >= elapsed && highRisks === 0 ? ['GREEN', '#16a34a'] : progress + 0.25 >= elapsed ? ['AMBER', '#d97706'] : ['RED', '#dc2626'];

  const byType = ['story', 'bug', 'task', 'spike'].map((t, i) => ({
    label: t,
    value: stories.filter((s) => s.type === t).length,
    color: ['#34d399', '#fb7185', '#a78bfa', '#fbbf24'][i],
  }));

  const epics = {};
  stories.forEach((s) => {
    epics[s.epic || 'None'] = epics[s.epic || 'None'] || { total: 0, done: 0 };
    epics[s.epic || 'None'].total += s.points;
    if (s.status === 'done') epics[s.epic || 'None'].done += s.points;
  });

  return (
    <>
      <div className="page-head no-print">
        <div>
          <h1>Reports</h1>
          <p>Velocity, scope mix, epic progress and a one-click stakeholder status report.</p>
        </div>
        <button className="btn" onClick={() => window.print()}>
          🖨 Print status report
        </button>
      </div>

      <div className="grid g3 no-print" style={{ marginBottom: 16 }}>
        <div className="card span2">
          <div className="card-head">
            <h3>Velocity (completed points)</h3>
          </div>
          <BarChart data={completed.map((s) => ({ label: s.name, value: s.completedPoints }))} />
          <div className="muted small" style={{ marginTop: 8 }}>
            Commitment accuracy:{' '}
            {completed.map((s) => `${s.name} ${Math.round((s.completedPoints / s.committedPoints) * 100)}%`).join(' · ')}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Work item mix</h3>
          </div>
          <Donut data={byType} />
        </div>
        <div className="card span2">
          <div className="card-head">
            <h3>Epic progress</h3>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {Object.entries(epics).map(([name, e]) => (
              <div key={name}>
                <div className="row between small">
                  <b>{name}</b>
                  <span className="muted">
                    {e.done}/{e.total} pts
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${e.total ? (e.done / e.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="status-report">
        <div className="row between">
          <div>
            <small style={{ color: '#6b6880', letterSpacing: '0.1em' }}>WEEKLY STATUS REPORT</small>
            <h2>Marketplace App — {active?.name || 'Between sprints'}</h2>
            <div style={{ color: '#6b6880' }}>Prepared {date(new Date())}</div>
          </div>
          <span className="rag" style={{ background: rag[1], color: '#fff' }}>
            {rag[0]}
          </span>
        </div>
        <h4 style={{ margin: '18px 0 6px' }}>Summary</h4>
        <p style={{ margin: 0 }}>
          Sprint goal: <b>{active?.goal}</b>. {done} of {total} points delivered ({Math.round(progress * 100)}%) with {Math.round(elapsed * 100)}% of the sprint
          elapsed. {highRisks} high-severity risk(s) open.
        </p>
        <h4 style={{ margin: '18px 0 6px' }}>Delivered this sprint</h4>
        <ul style={{ margin: 0 }}>
          {inSprint
            .filter((s) => s.status === 'done')
            .map((s) => (
              <li key={s._id}>
                {s.key} — {s.title}
              </li>
            ))}
        </ul>
        <h4 style={{ margin: '18px 0 6px' }}>In progress / next</h4>
        <ul style={{ margin: 0 }}>
          {inSprint
            .filter((s) => s.status !== 'done')
            .map((s) => (
              <li key={s._id}>
                {s.key} — {s.title} <i>({s.status})</i>
              </li>
            ))}
        </ul>
        <h4 style={{ margin: '18px 0 6px' }}>Risks & mitigations</h4>
        <table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Level</th>
              <th>Owner</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {risks
              .filter((r) => r.status !== 'closed')
              .sort((a, b) => riskScore(b) - riskScore(a))
              .map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{riskLevel(riskScore(r))[0]}</td>
                  <td>{r.owner}</td>
                  <td>{r.mitigation}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
