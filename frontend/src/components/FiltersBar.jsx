
export default function FiltersBar({ filters, setFilters, teams, users }) {
  const upd = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clear = () => setFilters({ search: '', teamId: '', assignee: '', status: '', priority: '' });
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <input className="input" placeholder="Search by task title..." value={filters.search} onChange={e => upd('search', e.target.value)} />
        <select className="input" value={filters.teamId} onChange={e => upd('teamId', e.target.value)}><option value="">All teams</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <select className="input" value={filters.assignee} onChange={e => upd('assignee', e.target.value)}><option value="">All members</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <select className="input" value={filters.status} onChange={e => upd('status', e.target.value)}><option value="">All statuses</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Completed</option></select>
        <select className="input" value={filters.priority} onChange={e => upd('priority', e.target.value)}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
      </div>
      <button className="text-sm text-indigo-600 mt-2" onClick={clear}>Clear filters</button>
    </div>
  );
}
