import { ArrowRight, Check, Mail, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { GoogleButton } from '../components/GoogleButton';
import { PasswordField } from '../components/PasswordField';
import { SetupNotice } from '../components/SetupNotice';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../lib/authErrors';
import {
  focusFirstInvalid,
  passwordRules,
  validateConfirm,
  validateEmail,
  validateName,
  validateNewPassword,
} from '../lib/validation';

type Status = 'idle' | 'password' | 'google';

export default function Signup() {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const errors = {
    name: touched.name ? validateName(name) : null,
    email: touched.email ? validateEmail(email) : null,
    password: touched.password ? validateNewPassword(password) : null,
    confirm: touched.confirm ? validateConfirm(password, confirm) : null,
  };
  const busy = status !== 'idle';
  const touch = (key: keyof typeof touched) => () => setTouched((t) => ({ ...t, [key]: true }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (validateName(name) || validateEmail(email) || validateNewPassword(password) || validateConfirm(password, confirm)) {
      focusFirstInvalid(form);
      return;
    }
    setError(null);
    setStatus('password');
    try {
      await signUp(name.trim(), email.trim(), password);
      // Success: the new account is signed in and PublicOnlyRoute sends it to /dashboard.
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setStatus('idle');
    }
  }

  async function handleGoogle() {
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
        <h2>Create your account</h2>
        <p>Start turning documents into structured data.</p>
      </div>

      {!configured ? <SetupNotice /> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <form onSubmit={handleSubmit} noValidate className="form">
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          icon={<User size={18} />}
          value={name}
          error={errors.name}
          onChange={(e) => setName(e.target.value)}
          onBlur={touch('name')}
          disabled={busy}
        />
        <TextField
          label="Work email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={touch('email')}
          disabled={busy}
        />
        <PasswordField
          label="Password"
          name="new-password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={touch('password')}
          disabled={busy}
          hint={
            <ul className="rules" aria-label="Password requirements">
              {passwordRules.map((rule) => {
                const met = rule.test(password);
                return (
                  <li key={rule.id} className={met ? 'rules__item rules__item--met' : 'rules__item'}>
                    <Check size={14} aria-hidden="true" />
                    {rule.label}
                    <span className="sr-only">{met ? ' (met)' : ' (not met)'}</span>
                  </li>
                );
              })}
            </ul>
          }
        />
        <PasswordField
          label="Confirm password"
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          error={errors.confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={touch('confirm')}
          disabled={busy}
        />

        <Button type="submit" loading={status === 'password'} disabled={busy || !configured}>
          {status === 'password' ? 'Creating account' : 'Create account'}
          {status === 'password' ? null : <ArrowRight size={18} aria-hidden="true" />}
        </Button>
      </form>

      <div className="divider"><span>or continue with</span></div>
      <GoogleButton label="Sign up with Google" loading={status === 'google'} disabled={busy || !configured} onClick={handleGoogle} />

      <p className="auth-panel__switch">
        Already have an account? <Link to="/login" className="link link--strong">Sign in</Link>
      </p>
      <p className="auth-panel__legal">
        By creating an account, you agree to our <Link to="/terms" className="link">Terms of Service</Link> and{' '}
        <Link to="/privacy" className="link">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
