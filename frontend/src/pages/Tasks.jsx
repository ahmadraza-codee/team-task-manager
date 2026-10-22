
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import FiltersBar from '../components/FiltersBar';
import TaskTable from '../components/TaskTable';

export default function Tasks({ mineOnly = false }) {
  const { user } = useAuth();
  const { openCreateTask, openEditTask } = useUI();
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ search: params.get('search') || '', teamId: params.get('teamId') || '', assignee: '', status: '', priority: '' });
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  useEffect(() => { setFilters(f => ({ ...f, search: params.get('search') || f.search, teamId: params.get('teamId') || f.teamId })); }, [params]);
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = { ...filters };
      if (mineOnly) query.assignee = String(user.id);
      const [t, tm] = await Promise.all([api.tasks(query), api.teams()]);
      setTasks(t.tasks); setTeams(tm.teams); setUsers(tm.users); setErr('');
    } catch (x) { setErr(x.message); }
    finally { setLoading(false); }
  }, [filters, user, mineOnly]);
  useEffect(() => { load(); const h = () => load(); window.addEventListener('tasks-changed', h); return () => window.removeEventListener('tasks-changed', h); }, [load]);
  const shownFilters = mineOnly ? { ...filters, assignee: '' } : filters;
  const setShown = (updater) => {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater({ ...prev, assignee: '' }) : updater;
      return { ...next, assignee: mineOnly ? '' : next.assignee };
    });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{mineOnly ? 'My Tasks' : 'All Tasks'}</h2><button className="btn" disabled={!teams.length && loading} onClick={() => openCreateTask()}>+ Create Task</button></div>
      <FiltersBar filters={shownFilters} setFilters={setShown} teams={teams} users={users} />
      {err && <p className="bg-red-50 text-red-700 p-3 rounded text-sm mb-3">{err}</p>}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {loading ? <p className="py-8 text-center text-slate-500">Loading tasks...</p>
          : tasks.length ? <TaskTable tasks={tasks} teams={teams} users={users} onChanged={load} onEdit={openEditTask} />
          : <div className="py-10 text-center text-slate-500"><p>No tasks found with these filters.</p><button className="btn mt-3" onClick={() => openCreateTask()}>Create a task</button></div>}
      </div>
    </div>
  );
}
