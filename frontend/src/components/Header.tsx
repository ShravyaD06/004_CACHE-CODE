import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Layers, Activity, Cpu, UserCheck, LogOut, Shield, User, Wrench } from 'lucide-react';
import type { DocumentItem } from '../types';

interface HeaderProps {
  documentCount?: number;
  documents?: DocumentItem[];
}

export type UserRole = 'USER' | 'REVIEWER' | 'ADMIN';

export const Header: React.FC<HeaderProps> = ({ documentCount = 0, documents = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('docusense_role') as UserRole) || 'REVIEWER';
  });

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('docusense_role', newRole);
    window.dispatchEvent(new Event('docusense_role_changed'));
  };

  const user = (() => {
    try {
      const saved = localStorage.getItem('docusense_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const handleSignOut = () => {
    localStorage.removeItem('docusense_user');
    window.location.href = '/';
  };

  // Processing Status summary pills per Section C Screen 1
  const total = documents.length > 0 ? documents.length : documentCount;
  const pendingReview = documents.filter((d) => d.status === 'NEEDS_REVIEW' || d.status === 'READY_FOR_REVIEW').length;
  const approved = documents.filter((d) => d.status === 'APPROVED').length;

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 sticky top-0 z-40 backdrop-blur-md shadow-lg shadow-slate-950/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <Logo />
          <span className="text-xs text-slate-400 border-l border-slate-800 pl-3 hidden sm:inline font-mono">
            Enterprise Information Extraction
          </span>
        </div>

        {/* Processing Status Summary Pills (Section C Screen 1) */}
        {total > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Pipeline Status:</span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-800 text-slate-200">
              Total: <strong>{total}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60">
              Pending Review: <strong>{pendingReview}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              Clean Approvals: <strong>{approved}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Role Selector (Section B & Screen 1) */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            {role === 'ADMIN' ? (
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
            ) : role === 'REVIEWER' ? (
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-sky-400" />
            )}
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              title="Switch Active Persona Role"
            >
              <option value="REVIEWER" className="bg-slate-900 text-slate-100">Reviewer / Validator</option>
              <option value="USER" className="bg-slate-900 text-slate-100">Document Processing User</option>
              <option value="ADMIN" className="bg-slate-900 text-slate-100">Schema Configurator / Admin</option>
            </select>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 relative">
            <button
              onClick={() => navigate('/workspace')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                currentPath === '/workspace' || currentPath.startsWith('/review')
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Workspace {total > 0 && <span className="px-1.5 py-0.5 text-[10px] bg-slate-950/40 rounded-full font-mono">{total}</span>}
            </button>

            <button
              onClick={() => navigate('/integrity')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                currentPath === '/integrity'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Integrity
            </button>

            <button
              onClick={() => navigate('/schemas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                currentPath === '/schemas'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Schemas
            </button>
          </nav>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">{user.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
