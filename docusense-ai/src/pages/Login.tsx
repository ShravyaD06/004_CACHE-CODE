import { ArrowRight, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { GoogleButton } from '../components/GoogleButton';
import { PasswordField } from '../components/PasswordField';
import { SetupNotice } from '../components/SetupNotice';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../lib/authErrors';
import { focusFirstInvalid, validateEmail, validateExistingPassword } from '../lib/validation';

type Status = 'idle' | 'password' | 'google';

export default function Login() {
  const { signIn, signInWithGoogle, configured, sessionExpired } = useAuth();
  const location = useLocation();
  const loggedOut = (location.state as { loggedOut?: boolean } | null)?.loggedOut;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const errors = {
    email: touched.email ? validateEmail(email) : null,
    password: touched.password ? validateExistingPassword(password) : null,
  };
  const busy = status !== 'idle';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return; // block duplicate submissions (e.g. Enter pressed twice)
    const form = event.currentTarget;
    setNotice(null);
    setTouched({ email: true, password: true });
    if (validateEmail(email) || validateExistingPassword(password)) {
      focusFirstInvalid(form);
      return;
    }
    setError(null);
    setStatus('password');
    try {
      await signIn(email.trim(), password, remember);
      // Success: PublicOnlyRoute redirects to /dashboard as soon as the user is set.
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setStatus('idle');
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setNotice(null);
    setError(null);
    setStatus('google');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setStatus('idle');
    }
  }

  return (
    <AuthLayout>
      <div className="auth-panel__head">
        <h2>Welcome back</h2>
        <p>Sign in to continue to your workspace.</p>
      </div>

      {!configured ? <SetupNotice /> : null}
      {sessionExpired ? <Alert tone="info">Your session has ended. Sign in again to continue.</Alert> : null}
      {loggedOut ? <Alert tone="success">You have been signed out.</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="info">{notice}</Alert> : null}

      <form onSubmit={handleSubmit} noValidate className="form">
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          disabled={busy}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          disabled={busy}
        />

        <div className="form__row">
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={busy} />
            <span className="check__box" aria-hidden="true" />
            Remember me
          </label>
          <button type="button" className="link" onClick={() => setNotice('Password reset is not available in this phase yet.')}>Forgot password?</button>
        </div>

        <Button type="submit" loading={status === 'password'} disabled={busy || !configured} icon={null}>
          {status === 'password' ? 'Signing in' : 'Sign in'}
          {status === 'password' ? null : <ArrowRight size={18} aria-hidden="true" />}
        </Button>
      </form>

      <div className="divider"><span>or continue with</span></div>
      <GoogleButton label="Sign in with Google" loading={status === 'google'} disabled={busy || !configured} onClick={handleGoogle} />

      <p className="auth-panel__switch">
        Don’t have an account? <button type="button" className="link link--strong" onClick={() => setNotice('Account creation is not available in this phase yet.')}>Create one</button>
      </p>
      <p className="auth-panel__legal">
        By continuing, you agree to our <button type="button" className="link" onClick={() => setNotice('The Terms of Service page is not available in this phase yet.')}>Terms of Service</button> and{' '}
        <button type="button" className="link" onClick={() => setNotice('The Privacy Policy page is not available in this phase yet.')}>Privacy Policy</button>.
      </p>
    </AuthLayout>
  );
}
