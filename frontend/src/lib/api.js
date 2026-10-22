
const BASE = import.meta.env.VITE_API_URL || ''; // empty -> vite proxy to localhost:5000 in dev
async function req(path, opts={}){ const r=await fetch(`${BASE}${path}`,{ credentials:'include', headers:{'Content-Type':'application/json'}, ...opts }); const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error || (data.errors?.[0]?.message) || 'Request failed'); return data; }
export const api = {
  health: ()=>req('/api/health'),
  register:(b)=>req('/api/auth/register',{method:'POST',body:JSON.stringify(b)}),
  login:(b)=>req('/api/auth/login',{method:'POST',body:JSON.stringify(b)}),
  logout:()=>req('/api/auth/logout',{method:'POST'}),
  me:()=>req('/api/auth/me'),
  teams:()=>req('/api/teams'), createTeam:(b)=>req('/api/teams',{method:'POST',body:JSON.stringify(b)}),
  team:(id)=>req(`/api/teams/${id}`), updateTeam:(id,b)=>req(`/api/teams/${id}`,{method:'PUT',body:JSON.stringify(b)}), deleteTeam:(id)=>req(`/api/teams/${id}`,{method:'DELETE'}),
  addMember:(id,user_id)=>req(`/api/teams/${id}/members`,{method:'POST',body:JSON.stringify({user_id})}), removeMember:(id,uid)=>req(`/api/teams/${id}/members/${uid}`,{method:'DELETE'}),
  invite:(id,email)=>req(`/api/teams/${id}/invite`,{method:'POST',body:JSON.stringify({email})}),
  tasks:(params={})=>req('/api/tasks?'+new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''&&v!=null))), createTask:(b)=>req('/api/tasks',{method:'POST',body:JSON.stringify(b)}), updateTask:(id,b)=>req(`/api/tasks/${id}`,{method:'PUT',body:JSON.stringify(b)}), deleteTask:(id)=>req(`/api/tasks/${id}`,{method:'DELETE'}),
  reminders:()=>req('/api/tasks/reminders'),
};
