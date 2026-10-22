
import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function MemberPanel({ team, members, users, onChange }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  if (!team) return null;
  const addByEmail = async (e) => {
    e.preventDefault();
    try { const d = await api.addMemberByEmail(team.id, email); onChange(d.members); setEmail(''); toast('Member added'); }
    catch (x) { toast(x.message, 'error'); }
  };
  const addBySelect = async () => {
    if (!userId) return;
    try { const d = await api.addMember(team.id, Number(userId)); onChange(d.members); setUserId(''); toast('Member added'); }
    catch (x) { toast(x.message, 'error'); }
  };
  const invite = async (e) => {
    e.preventDefault();
    try { const d = await api.invite(team.id, inviteEmail); toast(d.message); setInviteEmail(''); }
    catch (x) { toast(x.message, 'error'); }
  };
  const remove = async (m) => {
    if (!confirm(`Remove ${m.name} from this team?`)) return;
    try { const d = await api.removeMember(team.id, m.id); onChange(d.members); toast('Member removed'); }
    catch (x) { toast(x.message, 'error'); }
  };
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="font-semibold">Members of {team.name}</h3>
      <ul className="space-y-1.5 text-sm">
        {members.map(m => <li key={m.id} className="flex items-center justify-between gap-2"><span className="truncate">{m.name} <span className="text-slate-500">({m.email})</span> <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{m.role}</span></span>{m.role !== 'owner' && <button className="text-red-600 text-xs shrink-0" onClick={() => remove(m)}>Remove</button>}</li>)}
        {members.length === 0 && <li className="text-slate-500">No members yet.</li>}
      </ul>
      <form onSubmit={addByEmail} className="border-t pt-3 space-y-2">
        <p className="text-sm font-medium">Add member by email</p>
        <div className="flex gap-2"><input className="input" type="email" required placeholder="Registered user's email" value={email} onChange={e => setEmail(e.target.value)} /><button className="btn shrink-0">Add</button></div>
        <p className="text-xs text-slate-500">The user must already have an account. If no account exists for that email, you will see a "user not found" message - use the invite below instead.</p>
      </form>
      <div className="flex gap-2">
        <select className="input" value={userId} onChange={e => setUserId(e.target.value)}><option value="">Or select a registered user...</option>{(users || []).filter(u => !members.some(m => m.id === u.id)).map(u => <option key={u.id} value={u.id}>{u.name} - {u.email}</option>)}</select>
        <button className="btn-secondary shrink-0" onClick={addBySelect}>Add</button>
      </div>
      <form onSubmit={invite} className="border-t pt-3 space-y-2">
        <p className="text-sm font-medium">Invite via email (stubbed - no real email sent)</p>
        <div className="flex gap-2"><input className="input" type="email" required placeholder="colleague@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /><button className="btn-secondary shrink-0">Invite</button></div>
      </form>
    </div>
  );
}
