import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { DEMO } from '../lib/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('pm@scrumflow.app');
  const [password, setPassword] = useState(DEMO ? 'demo1234' : '');
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={submit}>
        <div className="brand" style={{ padding: 0 }}>
          <span className="logo">S</span>
          <span>
            Scrum<b>Flow</b>
          </span>
        </div>
        <div>
          <h2 style={{ fontSize: 26 }}>Ship sprints, not surprises.</h2>
          <p className="muted">Backlog, sprint board, risks and status reports — one place for the whole delivery team.</p>
        </div>
        <label className="field">
          Work email
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          Password
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="badge bad">{error}</div>}
        <button className="btn block">Sign in →</button>
        {DEMO && <p className="muted small">Demo mode — any 4+ character password works.</p>}
      </form>
    </div>
  );
}
