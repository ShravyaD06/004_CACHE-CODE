import React, { useState } from 'react';
import { Shield, Key, User, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; provider: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    if (googleClientId) {
      // Direct Google OAuth URL redirect if Client ID is configured
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'openid email profile';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
      window.location.href = authUrl;
    } else {
      setShowConfigDetails(true);
    }
  };

  const handleDemoSignIn = () => {
    const demoUser = {
      name: 'Document Reviewer',
      email: 'reviewer@docusense.ai',
      provider: 'google_demo'
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Sign in to DocuSense AI</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise document information extraction, verification, and audit trail platform.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all shadow-md active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.35 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>

          {!googleClientId && (
            <button
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold text-sm transition-all"
            >
              <User className="w-4 h-4" /> Instant Demo Sign-In
            </button>
          )}
        </div>

        {showConfigDetails && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Key className="w-4 h-4" /> Google OAuth Configuration Required
            </div>
            <p className="text-slate-400 leading-normal">
              To enable live production Google Sign-In, configure your OAuth credentials in Google Cloud Console:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 font-mono text-[11px]">
              <li>
                Authorized Origin:{' '}
                <span className="text-emerald-400">http://localhost:5173</span>
              </li>
              <li>
                Redirect URI:{' '}
                <span className="text-emerald-400">http://localhost:5173/auth/google/callback</span>
              </li>
              <li>
                Env Var: <span className="text-teal-300">VITE_GOOGLE_CLIENT_ID</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={handleDemoSignIn}
                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold transition-colors"
              >
                Proceed with Demo Session
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
          Encrypted OAuth 2.0 Auth • Zero Document Persistence without Consent
        </div>
      </div>
    </div>
  );
};
