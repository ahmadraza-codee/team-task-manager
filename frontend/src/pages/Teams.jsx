
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Teams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState({ open: false, team: null });
  const [form, setForm] = useState({ name: '', description: '' });
  const load = async () => {
    setLoading(true);
    try {
      const d = await api.teams(); setTeams(d.teams); setErr('');
      const entries = await Promise.all(d.teams.map(async t => { try { const det = await api.team(t.id); return [t.id, det.members.length]; } catch { return [t.id, null]; } }));
      setCounts(Object.fromEntries(entries));
    } catch (x) { setErr(x.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const openModal = (team = null) => { setForm(team ? { name: team.name, description: team.description || '' } : { name: '', description: '' }); setModal({ open: true, team }); };
  const save = async (e) => {
    e.preventDefault();
    try { if (modal.team) await api.updateTeam(modal.team.id, form); else await api.createTeam(form); toast(modal.team ? 'Team updated' : 'Team created'); setModal({ open: false, team: null }); load(); }
    catch (x) { toast(x.message, 'error'); }
  };
  const del = async (t) => { if (!confirm(`Delete team "${t.name}" and all its tasks?`)) return; try { await api.deleteTeam(t.id); toast('Team deleted'); load(); } catch (x) { toast(x.message, 'error'); } };
  const shown = teams.filter(t => (t.name + ' ' + (t.description || '')).toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4"><h2 className="text-xl font-bold">Teams</h2><button className="btn" onClick={() => openModal()}>+ Create Team</button></div>
      <input className="input mb-4" placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
      {err && <p className="bg-red-50 text-red-700 p-3 rounded text-sm mb-3">{err}</p>}
      {loading ? <p className="text-slate-500">Loading teams...</p> : shown.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-sm text-center text-slate-500"><p>{teams.length ? 'No teams match your search.' : 'No teams yet.'}</p><button className="btn mt-3" onClick={() => openModal()}>Create your first team</button></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2"><Link to={`/teams/${t.id}`} className="font-semibold hover:text-indigo-700">{t.name}</Link>{t.created_by === user.id && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Owner</span>}</div>
              <p className="text-sm text-slate-500 flex-1">{t.description || 'No description'}</p>
              <p className="text-xs text-slate-500">{counts[t.id] == null ? 'Members: -' : `Members: ${counts[t.id]}`}</p>
              <div className="flex gap-2 pt-1"><Link className="btn-secondary !py-1 text-sm" to={`/teams/${t.id}`}>Open</Link><button className="btn-secondary !py-1 text-sm" onClick={() => openModal(t)}>Edit</button>{t.created_by === user.id && <button className="text-red-600 text-sm ml-auto" onClick={() => del(t)}>Delete</button>}</div>
            </div>
          ))}
        </div>
      )}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><form onSubmit={save} className="bg-white rounded-xl w-full max-w-md p-6 space-y-3">
          <h3 className="text-lg font-bold">{modal.team ? 'Edit Team' : 'Create Team'}</h3>
          <div><label className="text-sm font-medium">Team name *</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Description</label><textarea className="input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false, team: null })}>Cancel</button><button className="btn">{modal.team ? 'Update' : 'Create'} Team</button></div>
        </form></div>
      )}
    </div>
  );
}
