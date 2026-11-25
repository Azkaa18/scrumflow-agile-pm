import { Link } from 'react-router-dom';
import useCollection from '../lib/useCollection';
import { LineChart } from '../components/Charts';
import { burndown, COLUMNS, riskLevel, riskScore } from '../lib/agile';
import { date } from '../lib/format';

export default function Dashboard() {
  const { items: sprints } = useCollection('sprints');
  const { items: stories } = useCollection('stories');
  const { items: risks } = useCollection('risks');

  const active = sprints.find((s) => s.status === 'active');
  const inSprint = stories.filter((s) => active && s.sprint === active._id);
  const total = inSprint.reduce((a, s) => a + s.points, 0);
  const done = inSprint.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const daysLeft = active ? Math.max(0, Math.ceil((new Date(active.endDate) - new Date()) / 86400000)) : 0;
  const bd = burndown(active, inSprint);
  const openRisks = risks.filter((r) => r.status !== 'closed').sort((a, b) => riskScore(b) - riskScore(a));
  const blockers = inSprint.filter((s) => s.priority === 'critical' && s.status !== 'done');
  const completed = sprints.filter((s) => s.status === 'completed');
  const velocity = completed.length ? Math.round(completed.reduce((a, s) => a + s.completedPoints, 0) / completed.length) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{active ? active.name : 'No active sprint'}</h1>
          <p>
            {active ? (
              <>
                🎯 {active.goal} · {date(active.startDate)} → {date(active.endDate)}
              </>
            ) : (
              'Start a sprint from the Sprints page.'
            )}
          </p>
        </div>
        <Link to="/board" className="btn">
          Open board
        </Link>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <span className="label">Sprint progress</span>
          <span className="value">{pct}%</span>
          <div className="progress">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="delta">
            {done} / {total} points done
          </span>
        </div>
        <div className="card stat">
          <span className="label">Days remaining</span>
          <span className="value">{daysLeft}</span>
          <span className="delta">{inSprint.filter((s) => s.status !== 'done').length} items still open</span>
        </div>
        <div className="card stat">
          <span className="label">Avg velocity</span>
          <span className="value">{velocity} pts</span>
          <span className="delta">last {completed.length} sprints</span>
        </div>
        <div className="card stat">
          <span className="label">Open risks</span>
          <span className="value" style={{ color: openRisks.some((r) => riskScore(r) >= 15) ? 'var(--danger)' : 'inherit' }}>
            {openRisks.length}
          </span>
          <span className="delta">{openRisks.filter((r) => riskScore(r) >= 15).length} high severity</span>
        </div>
      </div>

      <div className="grid g3">
        <div className="card span2">
          <div className="card-head">
            <h3>Burndown</h3>
            <span className="muted small">story points remaining</span>
          </div>
          <LineChart
            labels={bd.labels}
            series={[
              { name: 'Ideal', values: bd.ideal, color: '#5b5478', dashed: true },
              { name: 'Actual', values: bd.actual, color: 'var(--primary)' },
            ]}
          />
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Work by status</h3>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            {COLUMNS.map((c) => {
              const pts = inSprint.filter((s) => s.status === c.id).reduce((a, s) => a + s.points, 0);
              return (
                <div key={c.id}>
                  <div className="row between small">
                    <span>{c.label}</span>
                    <b>{pts} pts</b>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${total ? (pts / total) * 100 : 0}%`, background: c.id === 'done' ? 'var(--ok)' : undefined }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>🚧 Blockers & critical</h3>
          </div>
          {blockers.length === 0 && <div className="empty">Nothing critical open.</div>}
          {blockers.map((s) => (
            <div key={s._id} style={{ marginBottom: 12 }}>
              <span className="key">{s.key}</span>
              <div>
                <b>{s.title}</b>
              </div>
              <span className="badge bad">{s.status}</span>
            </div>
          ))}
        </div>

        <div className="card span2">
          <div className="card-head">
            <h3>Top risks</h3>
            <Link to="/risks" className="small">
              Risk register →
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Owner</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {openRisks.slice(0, 4).map((r) => {
                const [lvl, cls] = riskLevel(riskScore(r));
                return (
                  <tr key={r._id}>
                    <td>
                      <b>{r.title}</b>
                      <div className="muted small">{r.mitigation}</div>
                    </td>
                    <td>{r.owner}</td>
                    <td>
                      <span className={`badge ${cls}`}>
                        {riskScore(r)} · {lvl}
                      </span>
                    </td>
                    <td className="muted">{r.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
