import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { DEMO, resetDemo } from '../lib/api';
import { initials } from '../lib/format';

const nav = [
  ['/', 'Overview', '◎', true],
  ['/board', 'Sprint board', '▦'],
  ['/backlog', 'Backlog', '☰'],
  ['/sprints', 'Sprints', '⟳'],
  ['/risks', 'Risk register', '⚑'],
  ['/team', 'Team & capacity', '◍'],
  ['/reports', 'Reports', '↗'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <span className="logo">S</span>
          <span>
            Scrum<b>Flow</b>
          </span>
        </div>
        <div className="workspace">
          <small>WORKSPACE</small>
          <b>Marketplace App</b>
        </div>
        <nav>
          {nav.map(([to, label, icon, end]) => (
            <NavLink key={to} to={to} end={end}>
              <span className="ico">{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
        <div className="rail-foot">
          <div className="row">
            <div className="avatar">{initials(user?.name)}</div>
            <div style={{ lineHeight: 1.2 }}>
              <b>{user?.name}</b>
              <div className="muted small">{user?.role}</div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            {DEMO && (
              <button
                className="btn ghost sm"
                onClick={() => {
                  resetDemo();
                  window.location.reload();
                }}
              >
                Reset demo
              </button>
            )}
            <button className="btn ghost sm" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
