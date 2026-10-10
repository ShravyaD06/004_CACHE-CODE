import { AlertTriangle, CheckCircle2, ClipboardCheck, FileText, LogOut, UploadCloud, X } from 'lucide-react';
import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_BYTES = 20 * 1024 * 1024;

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const stats = [
  { label: 'Documents processed', value: '128', icon: CheckCircle2, tone: 'good' },
  { label: 'Needs review', value: '12', icon: ClipboardCheck, tone: 'warn' },
  { label: 'Validation issues', value: '5', icon: AlertTriangle, tone: 'bad' },
] as const;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const firstName = user?.displayName?.split(' ')[0];

  function addFiles(list: FileList | File[]) {
    const accepted: File[] = [];
    const rejected: string[] = [];
    Array.from(list).forEach((file) => {
      if (!ACCEPTED.includes(file.type)) rejected.push(`${file.name} is not a PDF, PNG or JPG.`);
      else if (file.size > MAX_BYTES) rejected.push(`${file.name} is larger than 20 MB.`);
      else accepted.push(file);
    });
    setProblems(rejected);
    if (accepted.length) setFiles((current) => [...current, ...accepted]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true, state: { loggedOut: true } });
    }
  }

  return (
    <div className="app">
      <header className="app__bar">
        <Logo to="/dashboard" />
        <div className="app__actions">
          <span className="app__user" title={user?.email ?? undefined}>{user?.displayName ?? user?.email}</span>
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout} loading={signingOut} icon={<LogOut size={16} aria-hidden="true" />}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="app__main">
        <section className="intro">
          <h1>Your documents, understood.</h1>
          <p>{firstName ? `Welcome, ${firstName}. ` : ''}Upload a document to get started.</p>
        </section>

        <section aria-labelledby="upload-title" className="block">
          <h2 id="upload-title" className="sr-only">Upload documents</h2>
          <div
            className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload documents. Drop files here or press Enter to browse."
            onClick={() => inputRef.current?.click()}
            onKeyDown={onKey}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <UploadCloud size={28} aria-hidden="true" />
            <p className="dropzone__title">Drop documents here, or browse</p>
            <p className="dropzone__hint">PDF, PNG or JPG, up to 20 MB each</p>
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {problems.length ? (
            <Alert tone="error">
              <ul className="plain-list">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </Alert>
          ) : null}

          {files.length ? (
            <div className="selected">
              <Alert tone="info">
                Processing is not connected yet. These files stay in your browser and are not uploaded.
              </Alert>
              <ul className="selected__list">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <FileText size={18} aria-hidden="true" />
                    <span className="selected__name">{file.name}</span>
                    <span className="selected__size">{formatSize(file.size)}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((c) => c.filter((_, i) => i !== index))}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="stats-title" className="block">
          <div className="block__head">
            <h2 id="stats-title">Overview</h2>
            <span className="badge">Sample data</span>
          </div>
          <div className="stats">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <article key={label} className={`stat stat--${tone}`}>
                <span className="stat__icon"><Icon size={18} aria-hidden="true" /></span>
                <p className="stat__value">{value}</p>
                <p className="stat__label">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-title" className="block">
          <div className="block__head">
            <h2 id="recent-title">Recent documents</h2>
          </div>
          <div className="empty">
            <FileText size={28} aria-hidden="true" />
            <p className="empty__title">No documents yet</p>
            <p className="empty__text">Upload an invoice, certificate or form. Processed documents will appear here.</p>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} icon={<UploadCloud size={16} aria-hidden="true" />}>
              Choose files
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
