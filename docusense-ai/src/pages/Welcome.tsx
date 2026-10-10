import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

/** Temporary post-login destination. Replace with the real workspace when it is integrated. */
export default function Welcome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true, state: { loggedOut: true } });
    }
  }

  return (
    <div className="legal">
      <header className="legal__bar">
        <Logo to="/welcome" />
        <ThemeToggle />
      </header>
      <main className="legal__body">
        <Alert tone="success">Signed in successfully.</Alert>
        <h1>You are signed in</h1>
        <p>Signed in as {user?.email ?? user?.displayName}. This is a temporary page; the workspace will be connected later.</p>
        <div><Button variant="secondary" loading={busy} onClick={handleLogout} className="">Sign out</Button></div>
      </main>
    </div>
  );
}
