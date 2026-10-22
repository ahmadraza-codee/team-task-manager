
import { useEffect, useState } from 'react';
export default function TaskModal({open,onClose,onSave,task,teams,members}){
  const [f,setF]=useState({title:'',description:'',status:'todo',priority:'medium',due_date:'',team_id:'',assigned_to:''});
  useEffect(()=>{ if(open) setF(task?{...task,due_date:task.due_date?String(task.due_date).slice(0,10):'',assigned_to:task.assigned_to||''}:{title:'',description:'',status:'todo',priority:'medium',due_date:'',team_id:teams[0]?.id||'',assigned_to:''}); },[open,task,teams]);
  if(!open) return null; const upd=(k,v)=>setF(s=>({...s,[k]:v}));
  return <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-auto"><h2 className="text-lg font-bold">{task?'Edit Task':'Create Task'}</h2>
  <input className="input" placeholder="Title *" value={f.title} onChange={e=>upd('title',e.target.value)}/>
  <textarea className="input" placeholder="Description" value={f.description||''} onChange={e=>upd('description',e.target.value)}/>
  <div className="grid grid-cols-2 gap-3"><select className="input" value={f.team_id} onChange={e=>upd('team_id',e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
  <select className="input" value={f.assigned_to} onChange={e=>upd('assigned_to',e.target.value)}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
  <select className="input" value={f.status} onChange={e=>upd('status',e.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select>
  <select className="input" value={f.priority} onChange={e=>upd('priority',e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
  <label className="text-sm">Due date <input type="date" className="input" value={f.due_date||''} onChange={e=>upd('due_date',e.target.value)}/></label>
  <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn" onClick={()=>onSave({...f,team_id:Number(f.team_id),assigned_to:f.assigned_to?Number(f.assigned_to):null,due_date:f.due_date||null})}>{task?'Update':'Create'}</button></div></div></div>;
}
