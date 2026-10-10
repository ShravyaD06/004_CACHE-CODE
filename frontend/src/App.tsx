import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { SideBySideReviewCanvas } from './components/SideBySideReviewCanvas';
import { IntegrityPanel } from './components/IntegrityPanel';
import { SchemaViewer } from './components/SchemaViewer';
import { ToastProvider } from './components/ToastNotification';
import { ThemeProvider } from './context/ThemeContext';
import { IntroAnimation } from './components/IntroAnimation';
import { api } from './services/api';
import type { DocumentItem } from './types';

const AppLayout: React.FC<{ children: React.ReactNode; documentCount: number; documents?: DocumentItem[]; user?: any }> = ({
  children,
  documentCount,
  documents
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-white transition-colors duration-200 pb-12">
      <Header documentCount={documentCount} documents={documents} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">{children}</main>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; provider: string } | null>(() => {
    try {
      const saved = localStorage.getItem('docusense_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userObj: { name: string; email: string; provider: string }) => {
    setUser(userObj);
    localStorage.setItem('docusense_user', JSON.stringify(userObj));
  };

  const fetchDocuments = async () => {
    try {
      const list = await api.listDocuments();
      setDocuments(list);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll for background job progress if any documents are in QUEUED or PROCESSING status
  useEffect(() => {
    const hasPendingJobs = documents.some((d) => d.status === 'QUEUED' || d.status === 'PROCESSING');
    if (!hasPendingJobs) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  return (
    <>
      <IntroAnimation />
      <Routes>
        <Route
          path="/"
          element={<LandingPage user={user} onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/workspace"
          element={
            <AppLayout documentCount={documents.length} documents={documents} user={user}>
              <WorkspaceDashboard documents={documents} onRefresh={fetchDocuments} />
            </AppLayout>
          }
        />
        <Route
          path="/review/:documentId"
          element={
            <AppLayout documentCount={documents.length} documents={documents} user={user}>
              <SideBySideReviewCanvas />
            </AppLayout>
          }
        />
        <Route
          path="/integrity"
          element={
            <AppLayout documentCount={documents.length} documents={documents} user={user}>
              <IntegrityPanel documents={documents} />
            </AppLayout>
          }
        />
        <Route
          path="/schemas"
          element={
            <AppLayout documentCount={documents.length} documents={documents} user={user}>
              <SchemaViewer />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
