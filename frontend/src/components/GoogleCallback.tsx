import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processOAuthResponse = async () => {
      try {
        // Parse token from hash fragment (#access_token=...)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        let accessToken = params.get('access_token');

        // Fallback to query string (?token=... or ?code=...)
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token') || searchParams.get('token');
          const error = searchParams.get('error') || params.get('error');
          if (error) {
            throw new Error(`Google OAuth error: ${error}`);
          }
        }

        if (!accessToken) {
          throw new Error('No access token returned from Google authentication provider.');
        }

        // Fetch user profile from Google's userinfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userInfoRes.ok) {
          throw new Error('Failed to retrieve user profile from Google UserInfo endpoint.');
        }

        const profile = await userInfoRes.json();
        const userObj = {
          name: profile.name || profile.given_name || 'Google User',
          email: profile.email,
          picture: profile.picture,
          provider: 'google',
          id: profile.sub,
          accessToken,
        };

        localStorage.setItem('docusense_user', JSON.stringify(userObj));
        setStatus('success');

        // Redirect to workspace after brief animation
        setTimeout(() => {
          window.location.href = '/workspace';
        }, 1000);
      } catch (err: any) {
        console.error('OAuth Callback processing error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred during Google authentication.');
      }
    };

    processOAuthResponse();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
        
        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Connecting Google Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verifying OAuth 2.0 credentials and establishing secure session...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="inline-flex p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-teal-600 dark:text-teal-300">Authentication Successful!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Welcome back. Redirecting to your DocuSense workspace...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-2 animate-in fade-in duration-200">
            <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-300">Authentication Failed</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
