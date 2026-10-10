import { FileSearch, ShieldCheck, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandVisual } from './BrandVisual';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const benefits = [
  { icon: FileSearch, title: 'Intelligent extraction', text: 'Pull key fields from any document.' },
  { icon: ShieldCheck, title: 'Rule-based validation', text: 'Catch errors before they reach your records.' },
  { icon: UserCheck, title: 'Human-reviewed accuracy', text: 'Data your team can trust and sign off.' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <section className="brand" aria-label="About DocuSense AI">
        <div className="brand__glow" aria-hidden="true" />
        <svg className="brand__ridge" viewBox="0 0 800 160" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#83D6AD" stopOpacity="0.22" />
              <stop offset="1" stopColor="#83D6AD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 160V110L90 80l70 26 110-62 90 58 80-30 120 52 90-44 150 54v56z" fill="url(#ridge)" />
          <path d="M0 110L90 80l70 26 110-62 90 58 80-30 120 52 90-44 150 54" fill="none" stroke="#B8F36B" strokeOpacity="0.35" />
        </svg>

        <header className="brand__top">
          <Logo tone="brand" />
        </header>

        <div className="brand__body">
          <p className="brand__badge">AI-powered document intelligence</p>
          <h1 className="brand__headline">
            Every document.
            <span>Clearer than ever.</span>
          </h1>
          <p className="brand__lede">
            Turn complex documents into structured, validated, decision-ready information.
          </p>
          <BrandVisual />
        </div>

        <ul className="benefits">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="benefits__icon"><Icon size={20} aria-hidden="true" /></span>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <main className="auth-main">
        <div className="auth-main__bar">
          <ThemeToggle />
        </div>
        <div className="auth-panel">
          <div className="auth-panel__logo">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
