
import { STATUS_LABELS, PRIORITY_LABELS, statusBadge, priorityBadge, isOverdue, fmtDate } from '../lib/format';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function TaskTable({ tasks, teams, users, onChanged, onEdit }) {
  const { toast } = useToast();
  const teamName = (id) => teams.find(t => t.id === id)?.name || '-';
  const userName = (id) => users.find(u => u.id === id)?.name || (id ? `#${id}` : 'Unassigned');
  const changeStatus = async (task, status) => {
    try { await api.updateTask(task.id, { title: task.title, description: task.description || '', status, priority: task.priority, due_date: task.due_date ? String(task.due_date).slice(0, 10) : null, team_id: task.team_id, assigned_to: task.assigned_to || null }); toast('Status updated'); onChanged && onChanged(); }
    catch (x) { toast(x.message, 'error'); }
  };
  const del = async (task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try { await api.deleteTask(task.id); toast('Task deleted'); onChanged && onChanged(); }
    catch (x) { toast(x.message, 'error'); }
  };
  if (!tasks.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead><tr className="text-left text-slate-500 border-b">
          <th className="py-2 pr-3">Task</th><th className="py-2 pr-3">Team</th><th className="py-2 pr-3">Assignee</th><th className="py-2 pr-3">Priority</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Due date</th><th className="py-2">Actions</th>
        </tr></thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="py-2.5 pr-3"><p className="font-medium">{t.title}</p>{t.description && <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>}</td>
              <td className="py-2.5 pr-3">{teamName(t.team_id)}</td>
              <td className="py-2.5 pr-3">{userName(t.assigned_to)}</td>
              <td className="py-2.5 pr-3"><span className={`text-xs px-2 py-1 rounded-full ${priorityBadge(t.priority)}`}>{PRIORITY_LABELS[t.priority] || t.priority}</span></td>
              <td className="py-2.5 pr-3">
                <select className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusBadge(t.status)}`} value={t.status} onChange={e => changeStatus(t, e.target.value)}>
                  <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Completed</option>
                </select>
              </td>
              <td className={`py-2.5 pr-3 ${isOverdue(t) ? 'text-red-600 font-semibold' : ''}`}>{fmtDate(t.due_date)}{isOverdue(t) ? ' (overdue)' : ''}</td>
              <td className="py-2.5 whitespace-nowrap"><button className="btn-secondary !py-1 !px-2.5 text-xs mr-2" onClick={() => onEdit && onEdit(t)}>Edit</button><button className="text-red-600 text-xs" onClick={() => del(t)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
