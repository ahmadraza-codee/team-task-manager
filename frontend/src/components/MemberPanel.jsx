
import { useState } from 'react'; import { api } from '../lib/api';
export default function MemberPanel({team,members,users,onChange}){
  const [userId,setUserId]=useState(''); const [email,setEmail]=useState(''); const [msg,setMsg]=useState('');
  if(!team) return null;
  const add=async()=>{ if(!userId) return; const d=await api.addMember(team.id,Number(userId)); onChange(d.members); setMsg('Member added'); };
  const invite=async()=>{ if(!email) return; const d=await api.invite(team.id,email); setMsg(d.message); setEmail(''); };
  return <div className="bg-white rounded-xl p-4 shadow-sm space-y-3"><h3 className="font-semibold">Members of {team.name}</h3>
  <ul className="space-y-1 text-sm">{members.map(m=><li key={m.id} className="flex justify-between"><span>{m.name} ({m.email}) <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{m.role}</span></span>{m.role!=='owner'&&<button className="text-red-600" onClick={async()=>{const d=await api.removeMember(team.id,m.id); onChange(d.members);}}>Remove</button>}</li>)}</ul>
  <div className="flex gap-2"><select className="input" value={userId} onChange={e=>setUserId(e.target.value)}><option value="">Select registered user...</option>{users.filter(u=>!members.some(m=>m.id===u.id)).map(u=><option key={u.id} value={u.id}>{u.name} - {u.email}</option>)}</select><button className="btn" onClick={add}>Add</button></div>
  <div className="border-t pt-3"><p className="text-sm font-medium mb-2">Invite via email (stubbed - no real email sent)</p><div className="flex gap-2"><input className="input" placeholder="colleague@example.com" value={email} onChange={e=>setEmail(e.target.value)}/><button className="btn-secondary" onClick={invite}>Invite</button></div></div>
  {msg&&<p className="text-sm text-green-700">{msg}</p>}</div>;
}
