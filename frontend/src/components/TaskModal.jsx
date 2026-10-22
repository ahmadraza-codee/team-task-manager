
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function TaskModal({ open, onClose, onSaved, task, teams, presetTeamId }) {
  const { toast } = useToast();
  const empty = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '', team_id: '', assigned_to: '' };
  const [f, setF] = useState(empty);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    if (task) setF({ title: task.title || '', description: task.description || '', status: task.status, priority: task.priority, due_date: task.due_date ? String(task.due_date).slice(0, 10) : '', team_id: String(task.team_id), assigned_to: task.assigned_to ? String(task.assigned_to) : '' });
    else setF({ ...empty, team_id: presetTeamId ? String(presetTeamId) : (teams[0] ? String(teams[0].id) : '') });
  }, [open, task, teams, presetTeamId]);
  useEffect(() => {
    if (!open || !f.team_id) { setMembers([]); return; }
    api.team(f.team_id).then(d => setMembers(d.members || [])).catch(() => setMembers([]));
  }, [open, f.team_id]);
  if (!open) return null;
  const upd = (k, v) => setF(s => ({ ...s, [k]: v }));
  const save = async () => {
    if (!f.title.trim()) return toast('Task title is required', 'error');
    if (!f.team_id) return toast('Please select a team', 'error');
    setSaving(true);
    try {
      const body = { title: f.title, description: f.description, status: f.status, priority: f.priority, due_date: f.due_date || null, team_id: Number(f.team_id), assigned_to: f.assigned_to ? Number(f.assigned_to) : null };
      if (task) await api.updateTask(task.id, body); else await api.createTask(body);
      toast(task ? 'Task updated' : 'Task created');
      onSaved && onSaved();
      onClose();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold">{task ? 'Edit Task' : 'Create New Task'}</h2>
        <div><label className="text-sm font-medium">Task title *</label><input className="input" placeholder="e.g. Build authentication API" value={f.title} onChange={e => upd('title', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Description</label><textarea className="input" rows="3" placeholder="Describe what needs to be done..." value={f.description} onChange={e => upd('description', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium">Team *</label><select className="input" value={f.team_id} onChange={e => { upd('team_id', e.target.value); upd('assigned_to', ''); }}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className="text-sm font-medium">Assignee</label><select className="input" value={f.assigned_to} onChange={e => upd('assigned_to', e.target.value)}><option value="">Unassigned</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><label className="text-sm font-medium">Status</label><select className="input" value={f.status} onChange={e => upd('status', e.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Completed</option></select></div>
          <div><label className="text-sm font-medium">Priority</label><select className="input" value={f.priority} onChange={e => upd('priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        </div>
        <div><label className="text-sm font-medium">Due date</label><input type="date" className="input" value={f.due_date} onChange={e => upd('due_date', e.target.value)} /></div>
        <div className="flex justify-end gap-2 pt-2"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn" disabled={saving} onClick={save}>{saving ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}</button></div>
      </div>
    </div>
  );
}
