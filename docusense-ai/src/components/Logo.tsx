import { Link } from 'react-router-dom';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M6 10.5V25a2.5 2.5 0 0 0 2.5 2.5H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M11 4.5h9l6 6V22a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M20 4.5v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13.5 15h8M13.5 19h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

interface LogoProps {
  to?: string;
  tone?: 'default' | 'brand';
}

export function Logo({ to = '/', tone = 'default' }: LogoProps) {
  return (
    <Link to={to} className={`logo logo--${tone}`} aria-label="DocuSense AI home">
      <LogoMark />
      <span className="logo__word">
        DocuSense <span className="logo__ai">AI</span>
      </span>
    </Link>
  );
}
