import React, { useEffect, useState } from 'react';

export const IntroAnimation: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Check if intro has already played in this browser session
    const hasPlayed = sessionStorage.getItem('docusense_intro_played');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasPlayed || prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    // Show intro modal
    setVisible(true);

    // Sequence timings (total duration ~1.3s)
    const fadeOutTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1200);

    const closeTimer = setTimeout(() => {
      sessionStorage.setItem('docusense_intro_played', 'true');
      setVisible(false);
      if (onComplete) onComplete();
    }, 1500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4 px-6 text-center">
        {/* Animated Document Logo Silhouette */}
        <div className="relative w-16 h-16 transition-transform duration-700 transform scale-100 hover:scale-105">
          <svg className="w-16 h-16 text-indigo-600 dark:text-indigo-400" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Minimal document body */}
            <path
              d="M10 6C10 4.89543 10.8954 4 12 4H24L32 12V34C32 35.1046 31.1046 36 30 36H12C10.8954 36 10 35.1046 10 34V6Z"
              fill="currentColor"
              fillOpacity="0.08"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-in fade-in zoom-in-95 duration-500"
            />
            {/* Folded page corner */}
            <path
              d="M24 4V12H32"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Subtle verification mark */}
            <path
              d="M17 22L20 25L25 18"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-in fade-in duration-700 delay-300"
            />
          </svg>
        </div>

        {/* Wordmark Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          DocuSense <span className="text-indigo-600 dark:text-teal-400">AI</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-in fade-in duration-700 delay-400">
          Extract. Validate. Verify. Correct.
        </p>
      </div>
    </div>
  );
};
