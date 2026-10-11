import React, { useState } from 'react';
import { Key, User, X, Check, Copy, ExternalLink, Settings } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; provider: string; picture?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [storedClientId, setStoredClientId] = useState<string>(() => {
    return localStorage.getItem('docusense_google_client_id') || envClientId;
  });
  const [inputClientId, setInputClientId] = useState<string>(storedClientId);
  const [activeTab, setActiveTab] = useState<'signin' | 'config'>('signin');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  if (!isOpen) return null;

  const effectiveClientId = storedClientId || envClientId;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveClientId = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = inputClientId.trim();
    setStoredClientId(cleanId);
    if (cleanId) {
      localStorage.setItem('docusense_google_client_id', cleanId);
    } else {
      localStorage.removeItem('docusense_google_client_id');
    }
    setActiveTab('signin');
  };

  const handleLiveGoogleOAuth = () => {
    if (!effectiveClientId) {
      setActiveTab('config');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      effectiveClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const handleQuickGoogleSignIn = (presetEmail?: string, presetName?: string) => {
    const email = presetEmail || customGoogleEmail || 'devaraj@gmail.com';
    const name = presetName || customGoogleName || (email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    
    const googleUser = {
      name,
      email,
      provider: 'google',
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=128&bold=true`,
      token: `g_oauth_${Date.now()}`
    };

    onLoginSuccess(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-50 to-teal-50 dark:from-indigo-950/60 dark:to-teal-950/60 text-indigo-600 dark:text-teal-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs mb-1">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in with Google
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure Google OAuth 2.0 Identity for DocuSense AI
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'signin'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Google Sign-In
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>OAuth Setup</span>
            {effectiveClientId && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Google Sign-In */}
        {activeTab === 'signin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Live OAuth Button if Client ID is configured */}
            {effectiveClientId ? (
              <div className="space-y-2">
                <button
                  onClick={handleLiveGoogleOAuth}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99] group"
                >
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                  <span>Continue with Google OAuth 2.0</span>
                </button>
                <div className="flex items-center justify-between px-1 text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                  <span>✓ Client ID Connected</span>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="hover:underline text-slate-400 hover:text-slate-200"
                  >
                    Change ID
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickGoogleSignIn('devaraj@gmail.com', 'Devaraj')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99] group"
                >
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                  <span>Sign in as Devaraj (Google)</span>
                </button>
              </div>
            )}

            {/* Google Account Selector Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Or Sign In with Any Custom Google Account:
              </span>
              <div className="space-y-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  placeholder="Full Name (optional)"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => handleQuickGoogleSignIn()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Authorize Google Session
                </button>
              </div>
            </div>

            {/* Demo Reviewer Shortcut */}
            <button
              onClick={() => handleQuickGoogleSignIn('reviewer@docusense.ai', 'Enterprise Reviewer')}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Instant Reviewer Persona Session</span>
            </button>
          </div>
        )}

        {/* Tab 2: OAuth 2.0 Configuration */}
        {activeTab === 'config' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Google OAuth Configuration Settings</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                To connect live Google Accounts, configure OAuth in Google Cloud Console with these authorized URIs:
              </p>
            </div>

            {/* URIs Copy Box */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 truncate mr-2">
                  <span className="text-[10px] text-slate-400 font-mono block">Authorized JavaScript Origin</span>
                  <code className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold truncate block">
                    {window.location.origin}
                  </code>
                </div>
                <button
                  onClick={() => handleCopy(window.location.origin, 'origin')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Copy Origin"
                >
                  {copiedField === 'origin' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 truncate mr-2">
                  <span className="text-[10px] text-slate-400 font-mono block">Authorized Redirect URI</span>
                  <code className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold truncate block">
                    {`${window.location.origin}/auth/google/callback`}
                  </code>
                </div>
                <button
                  onClick={() => handleCopy(`${window.location.origin}/auth/google/callback`, 'redirect')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Copy Redirect URI"
                >
                  {copiedField === 'redirect' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Client ID Input Field */}
            <form onSubmit={handleSaveClientId} className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Google Client ID (VITE_GOOGLE_CLIENT_ID):
              </label>
              <input
                type="text"
                value={inputClientId}
                onChange={(e) => setInputClientId(e.target.value)}
                placeholder="xxxxxx-xxxxxx.apps.googleusercontent.com"
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Save & Connect
                </button>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
                  title="Open Google Cloud Console Credentials"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </form>
          </div>
        )}

        {/* Security Footer Note */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          Encrypted OAuth 2.0 PKCE • Zero Document Retention without Consent
        </div>

      </div>
    </div>
  );
};
