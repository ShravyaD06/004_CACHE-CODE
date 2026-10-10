import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

const content = {
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Using DocuSense AI', 'Replace this placeholder with the terms that govern use of your service, including acceptable use and account responsibilities.'],
      ['Your documents', 'Describe who owns uploaded documents, how long they are retained, and who can access them.'],
      ['Changes', 'Explain how people are notified when these terms change.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Replace this placeholder with the personal data you collect: account details, uploaded documents and usage data.'],
      ['How it is used', 'Describe why each kind of data is processed and which providers (for example Firebase Authentication) handle it.'],
      ['Your choices', 'Explain how people can access, export or delete their data.'],
    ],
  },
} as const;

export default function Legal({ kind }: { kind: keyof typeof content }) {
  const page = content[kind];
  return (
    <div className="legal">
      <header className="legal__bar">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="legal__body">
        <Link to="/login" className="link link--back"><ArrowLeft size={16} aria-hidden="true" /> Back</Link>
        <h1>{page.title}</h1>
        <p className="legal__draft">Draft placeholder. Have this reviewed and replaced with your real policy before launch.</p>
        {page.sections.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
