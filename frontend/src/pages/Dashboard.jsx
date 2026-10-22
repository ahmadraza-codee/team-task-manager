
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import ReminderBanner from '../components/ReminderBanner';
import TaskTable from '../components/TaskTable';

function StatCard({ label, value, accent }) {
  return <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className={`text-3xl font-bold mt-1 ${accent || ''}`}>{value}</p></div>;
}
export default function Dashboard() {
  const { user } = useAuth();
  const { openCreateTask, openEditTask } = useUI();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [err, setErr] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const load = async () => {
    try {
      const [d, t] = await Promise.all([api.dashboard(), api.teams()]);
      setData(d); setTeams(t.teams); setUsers(t.users);
    } catch (x) { setErr(x.message); }
  };
  useEffect(() => { load(); const h = () => load(); window.addEventListener('tasks-changed', h); return () => window.removeEventListener('tasks-changed', h); }, []);
  const createTeam = async (e) => {
    e.preventDefault();
    try { await api.createTeam(teamForm); setTeamForm({ name: '', description: '' }); setShowTeamForm(false); load(); }
    catch (x) { setErr(x.message); }
  };
  if (err) return <p className="bg-red-50 text-red-700 p-3 rounded text-sm">{err}</p>;
  if (!data) return <p className="p-4">Loading dashboard...</p>;
  const s = data.stats;
  return (
    <div className="space-y-4">
      <ReminderBanner reminders={data.reminders} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={s.total} />
        <StatCard label="In Progress" value={s.in_progress} accent="text-blue-600" />
        <StatCard label="Completed" value={s.completed} accent="text-green-600" />
        <StatCard label="Overdue" value={s.overdue} accent="text-red-600" />
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-2 items-center">
        <span className="font-semibold mr-auto">Quick actions</span>
        <button className="btn" onClick={() => openCreateTask()}>Create Task</button>
        <button className="btn-secondary" onClick={() => setShowTeamForm(v => !v)}>Create Team</button>
        <Link className="btn-secondary" to="/teams">View Teams</Link>
      </div>
      {showTeamForm && <form onSubmit={createTeam} className="bg-white rounded-xl p-4 shadow-sm space-y-2"><h3 className="font-semibold">Create a team</h3><input className="input" placeholder="Team name *" required value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} /><input className="input" placeholder="Description (optional)" value={teamForm.description} onChange={e => setTeamForm({ ...teamForm, description: e.target.value })} /><button className="btn">Create Team</button></form>}
      <div className="grid xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">My Tasks</h3><Link to="/my-tasks" className="text-sm text-indigo-600">View all</Link></div>
            {data.my_tasks.length ? <TaskTable tasks={data.my_tasks} teams={teams} users={users} onChanged={load} onEdit={openEditTask} /> : <p className="text-sm text-slate-500 py-6 text-center">No tasks assigned to you yet. <button className="text-indigo-600" onClick={() => openCreateTask()}>Create one</button></p>}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Recent Tasks</h3><Link to="/tasks" className="text-sm text-indigo-600">View all</Link></div>
            {data.recent_tasks.length ? <TaskTable tasks={data.recent_tasks} teams={teams} users={users} onChanged={load} onEdit={openEditTask} /> : <p className="text-sm text-slate-500 py-6 text-center">No tasks yet - create your first task to get started.</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">My Teams</h3><Link to="/teams" className="text-sm text-indigo-600">View all</Link></div>
          <ul className="space-y-2">
            {teams.map(t => <li key={t.id}><Link to={`/teams/${t.id}`} className="block border rounded-lg p-3 hover:bg-slate-50"><p className="font-medium">{t.name}</p><p className="text-xs text-slate-500">{t.description || 'No description'}{t.created_by === user.id ? ' - You are the owner' : ''}</p></Link></li>)}
            {teams.length === 0 && <li className="text-sm text-slate-500 py-4 text-center">You are not in any team yet. Create your first team above.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
