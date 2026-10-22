
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  useEffect(() => { api.teams().then(d => setTeams(d.teams)).catch(() => {}); api.dashboard().then(d => setStats(d.stats)).catch(() => {}); }, []);
  const doLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
        <span className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">{initials(user?.name)}</span>
        <div><h2 className="text-xl font-bold">{user?.name}</h2><p className="text-slate-500">{user?.email}</p>{user?.created_at && <p className="text-xs text-slate-400">Member since {String(user.created_at).slice(0, 10)}</p>}</div>
      </div>
      {stats && <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-slate-500">My Tasks</p><p className="text-2xl font-bold">{stats.my_tasks}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-slate-500">Teams</p><p className="text-2xl font-bold">{stats.teams}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-slate-500">Overdue</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></div>
      </div>}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-2">My Teams</h3>
        <ul className="space-y-2">{teams.map(t => <li key={t.id}><Link to={`/teams/${t.id}`} className="block border rounded-lg p-3 hover:bg-slate-50"><span className="font-medium">{t.name}</span><span className="text-xs text-slate-500"> - {t.created_by === user.id ? 'Owner' : 'Member'}</span></Link></li>)}{teams.length === 0 && <li className="text-sm text-slate-500">No teams yet.</li>}</ul>
      </div>
      <button className="btn-secondary !text-red-600" onClick={doLogout}>Logout</button>
    </div>
  );
}
