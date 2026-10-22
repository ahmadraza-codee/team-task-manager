
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import MemberPanel from '../components/MemberPanel';
import TaskTable from '../components/TaskTable';
import { STATUS_LABELS } from '../lib/format';

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { openCreateTask, openEditTask } = useUI();
  const nav = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try {
      const [det, list, all] = await Promise.all([api.team(id), api.tasks({ teamId: id }), api.teams()]);
      setTeam(det.team); setMembers(det.members); setTasks(list.tasks); setUsers(all.users); setErr('');
    } catch (x) { setErr(x.message); }
  }, [id]);
  useEffect(() => { load(); const h = () => load(); window.addEventListener('tasks-changed', h); return () => window.removeEventListener('tasks-changed', h); }, [load]);
  if (err) return <div><p className="bg-red-50 text-red-700 p-3 rounded text-sm">{err}</p><Link to="/teams" className="text-indigo-600 text-sm">Back to Teams</Link></div>;
  if (!team) return <p className="p-4">Loading team...</p>;
  const counts = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach(t => { if (counts[t.status] != null) counts[t.status]++; });
  const del = async () => { if (!confirm(`Delete team "${team.name}" and all its tasks?`)) return; try { await api.deleteTeam(team.id); nav('/teams'); } catch (x) { setErr(x.message); } };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div><Link to="/teams" className="text-sm text-indigo-600">← Teams</Link><h2 className="text-2xl font-bold mt-1">{team.name}</h2><p className="text-slate-500">{team.description || 'No description'}</p></div>
        <div className="flex gap-2"><button className="btn" onClick={() => openCreateTask(team.id)}>+ Create Task</button>{team.created_by === user.id && <button className="btn-secondary !text-red-600" onClick={del}>Delete Team</button>}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([k, v]) => <div key={k} className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-slate-500">{STATUS_LABELS[k]}</p><p className="text-2xl font-bold mt-1">{v}</p></div>)}
      </div>
      <div className="grid xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Team Tasks</h3>
          {tasks.length ? <TaskTable tasks={tasks} teams={[team]} users={users} onChanged={load} onEdit={openEditTask} /> : <p className="text-sm text-slate-500 py-6 text-center">No tasks in this team yet. <button className="text-indigo-600" onClick={() => openCreateTask(team.id)}>Create one</button></p>}
        </div>
        <MemberPanel team={team} members={members} users={users} onChange={setMembers} />
      </div>
    </div>
  );
}
