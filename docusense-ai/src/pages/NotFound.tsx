import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export default function NotFound() {
  return (
    <div className="legal">
      <header className="legal__bar"><Logo /></header>
      <main className="legal__body">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link to="/dashboard" className="link link--strong">Go to your workspace</Link>
      </main>
    </div>
  );
}
