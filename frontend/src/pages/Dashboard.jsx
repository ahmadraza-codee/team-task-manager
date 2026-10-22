
import { useCallback, useEffect, useState } from 'react'; import { api } from '../lib/api'; import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal'; import MemberPanel from '../components/MemberPanel'; import ReminderBanner from '../components/ReminderBanner';
const badge=(v)=>({todo:'bg-slate-200',in_progress:'bg-blue-100 text-blue-800',done:'bg-green-100 text-green-800',low:'bg-slate-100',medium:'bg-amber-100 text-amber-800',high:'bg-red-100 text-red-800'}[v]||'bg-slate-100');
export default function Dashboard(){
  const {user}=useAuth(); const [teams,setTeams]=useState([]); const [users,setUsers]=useState([]); const [tasks,setTasks]=useState([]); const [members,setMembers]=useState([]); const [reminders,setReminders]=useState(null);
  const [filters,setFilters]=useState({teamId:'',assignee:'',status:'',search:''}); const [selectedTeam,setSelectedTeam]=useState(null);
  const [teamForm,setTeamForm]=useState({name:'',description:''}); const [modal,setModal]=useState({open:false,task:null}); const [msg,setMsg]=useState(''); const [err,setErr]=useState('');
  const loadTeams=useCallback(async()=>{ const d=await api.teams(); setTeams(d.teams); setUsers(d.users); return d.teams; },[]);
  const loadTasks=useCallback(async()=>{ const d=await api.tasks(filters); setTasks(d.tasks); },[filters]);
  useEffect(()=>{ loadTeams(); api.reminders().then(setReminders).catch(()=>{}); },[loadTeams]);
  useEffect(()=>{ loadTasks().catch(e=>setErr(e.message)); },[loadTasks]);
  useEffect(()=>{ if(selectedTeam) api.team(selectedTeam.id).then(d=>setMembers(d.members)).catch(()=>{}); else if(teams.length) { /* load members of all teams via users fallback */ setMembers(users); } },[selectedTeam,teams,users]);
  // members for task assignment: members of selected/filter team, else all users
  const assignable = selectedTeam ? members : users;
  const createTeam=async(e)=>{ e.preventDefault(); try{ await api.createTeam(teamForm); setTeamForm({name:'',description:''}); await loadTeams(); setMsg('Team created'); }catch(x){ setErr(x.message);} };
  const saveTask=async(data)=>{ try{ if(modal.task) await api.updateTask(modal.task.id,data); else await api.createTask(data); setModal({open:false,task:null}); await loadTasks(); api.reminders().then(setReminders); }catch(x){ setErr(x.message);} };
  const isOverdue=(t)=> t.due_date && t.status!=='done' && String(t.due_date).slice(0,10) < new Date().toISOString().slice(0,10);
  return <div className="max-w-7xl mx-auto p-4 grid lg:grid-cols-[300px,1fr] gap-4">
    <aside className="space-y-4"><div className="bg-white rounded-xl p-4 shadow-sm"><h2 className="font-bold mb-3">Teams</h2>
      <ul className="space-y-2 mb-4">{teams.map(t=><li key={t.id} className={`p-2 rounded-lg cursor-pointer ${selectedTeam?.id===t.id?'bg-indigo-50 border border-indigo-200':''}`} onClick={()=>{setSelectedTeam(t); setFilters(f=>({...f,teamId:String(t.id)}));}}><div className="font-medium flex justify-between"><span>{t.name}</span>{t.created_by===user.id&&<button className="text-xs text-red-600" onClick={async(e)=>{e.stopPropagation(); if(confirm('Delete this team?')){ await api.deleteTeam(t.id); setSelectedTeam(null); setFilters(f=>({...f,teamId:''})); loadTeams(); loadTasks(); }}}>Delete</button>}</div><p className="text-xs text-slate-500">{t.description}</p></li>)}{teams.length===0&&<p className="text-sm text-slate-500">No teams yet. Create your first team below.</p>}</ul>
      <form onSubmit={createTeam} className="space-y-2 border-t pt-3"><input className="input" placeholder="Team name *" required value={teamForm.name} onChange={e=>setTeamForm({...teamForm,name:e.target.value})}/><input className="input" placeholder="Description" value={teamForm.description} onChange={e=>setTeamForm({...teamForm,description:e.target.value})}/><button className="btn w-full">Create Team</button></form></div>
      {selectedTeam&&<MemberPanel team={selectedTeam} members={members} users={users} onChange={setMembers}/>}
    </aside>
    <main>{err&&<p className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">{err}</p>}{msg&&<p className="bg-green-50 text-green-700 p-2 rounded mb-3 text-sm">{msg}</p>}
      <ReminderBanner reminders={reminders}/>
      <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex flex-wrap gap-2 items-center justify-between mb-4"><h2 className="font-bold text-lg">Tasks</h2><button className="btn" disabled={!teams.length} onClick={()=>setModal({open:true,task:null})}>+ New Task</button></div>
      <div className="grid sm:grid-cols-4 gap-2 mb-4"><input className="input" placeholder="Search tasks..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/>
      <select className="input" value={filters.teamId} onChange={e=>setFilters({...filters,teamId:e.target.value})}><option value="">All teams</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <select className="input" value={filters.assignee} onChange={e=>setFilters({...filters,assignee:e.target.value})}><option value="">All assignees</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>
      <select className="input" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All statuses</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></div>
      <div className="space-y-2">{tasks.map(t=>{ const team=teams.find(x=>x.id===t.team_id); const assignee=users.find(u=>u.id===t.assigned_to); return <div key={t.id} className="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"><div><p className="font-medium">{t.title}</p><p className="text-sm text-slate-500">{t.description}</p><p className="text-xs text-slate-500">{team?.name||''} {assignee?`• Assigned to ${assignee.name}`:'• Unassigned'} {t.due_date&&<>• Due <span className={isOverdue(t)?'text-red-600 font-semibold':''}>{String(t.due_date).slice(0,10)}{isOverdue(t)?' (overdue)':''}</span></>}</p></div><div className="flex items-center gap-2 shrink-0"><span className={`text-xs px-2 py-1 rounded-full ${badge(t.status)}`}>{t.status}</span><span className={`text-xs px-2 py-1 rounded-full ${badge(t.priority)}`}>{t.priority}</span><button className="btn-secondary !py-1" onClick={()=>setModal({open:true,task:t})}>Edit</button><button className="text-red-600 text-sm" onClick={async()=>{ if(confirm('Delete task?')){ await api.deleteTask(t.id); loadTasks(); }}}>Delete</button></div></div>; })}
      {tasks.length===0&&<div className="text-center py-10 text-slate-500">No tasks found. Create a team, then add your first task.</div>}</div></div>
    </main>
    <TaskModal open={modal.open} task={modal.task} teams={teams} members={assignable} onClose={()=>setModal({open:false,task:null})} onSave={saveTask}/>
  </div>;
}
