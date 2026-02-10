
import React from 'react';
import { Shield, Check, X, UserCog, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminPanelProps {
  users: User[];
  onApprove: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, onApprove, onChangeRole, onClose }) => {
  const pendingUsers = users.filter(u => u.role === 'PHOTOGRAPHER' && !u.isApproved);
  const approvedUsers = users.filter(u => u.isApproved || u.role !== 'PHOTOGRAPHER');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-primary-500" />
            <h2 className="text-2xl font-black">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Pending Photographers */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={16} /> Čekající fotografové ({pendingUsers.length})
            </h3>
            <div className="space-y-3">
              {pendingUsers.length === 0 ? (
                <p className="text-slate-500 italic text-sm">Žádné nové žádosti o registraci.</p>
              ) : (
                pendingUsers.map(user => (
                  <div key={user.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-bold">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => onApprove(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      <Check size={14} /> Schválit
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* User List & Roles */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCog size={16} /> Správa uživatelů
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedUsers.map(user => (
                <div key={user.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{user.username}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                      user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 
                      user.role === 'EDITOR' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-primary-500/10 text-primary-500'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <select 
                    value={user.role}
                    onChange={(e) => onChangeRole(user.id, e.target.value as UserRole)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs p-1 outline-none"
                  >
                    <option value="GUEST">GUEST</option>
                    <option value="PHOTOGRAPHER">PHOTOGRAPHER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
