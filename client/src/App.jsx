import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAuth } from './lib/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Backlog from './pages/Backlog';
import Sprints from './pages/Sprints';
import Risks from './pages/Risks';
import Team from './pages/Team';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="board" element={<Board />} />
        <Route path="backlog" element={<Backlog />} />
        <Route path="sprints" element={<Sprints />} />
        <Route path="risks" element={<Risks />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
