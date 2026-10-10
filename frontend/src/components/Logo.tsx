import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', iconOnly = false }) => {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg py-1 px-1.5 transition-all duration-200"
      aria-label="DocuSense AI Home"
    >
      {/* Document Icon with folded corner micro-interaction */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
          <svg
            className={`${className} text-indigo-600 dark:text-indigo-400`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Document outline */}
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            {/* Folded page corner with smooth translation shift on hover */}
            <polyline
              points="14 2 14 8 20 8"
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
            />
            {/* Verification checkmark in teal */}
            <path d="m9 15 2 2 4-4" strokeWidth="2.5" className="text-teal-600 dark:text-teal-400" />
          </svg>
        </div>
      </div>

      {!iconOnly && (
        <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-200">
          DocuSense<span className="text-indigo-600 dark:text-teal-400"> AI</span>
        </span>
      )}
    </Link>
  );
};
