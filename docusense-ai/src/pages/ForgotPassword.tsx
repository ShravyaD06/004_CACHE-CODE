import { ArrowLeft, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { SetupNotice } from '../components/SetupNotice';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../lib/authErrors';
import { focusFirstInvalid, validateEmail } from '../lib/validation';

export default function ForgotPassword() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailError = touched ? validateEmail(email) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (validateEmail(email)) {
      focusFirstInvalid(event.currentTarget);
      return;
    }
    setError(null);
    setSentTo(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      // Do not reveal whether an account exists for this address.
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found') setSentTo(email.trim());
      else setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-panel__head">
        <h2>Reset your password</h2>
        <p>Enter your email and we will send you a link to choose a new password.</p>
      </div>

      {!configured ? <SetupNotice /> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {sentTo ? (
        <Alert tone="success">
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. Check your inbox and spam folder.
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="form">
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          error={emailError}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={loading}
        />
        <Button type="submit" loading={loading} disabled={!configured}>
          {loading ? 'Sending link' : sentTo ? 'Send again' : 'Send reset link'}
        </Button>
      </form>

      <p className="auth-panel__switch">
        <Link to="/login" className="link link--strong link--back">
          <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
