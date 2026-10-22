
export const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Completed' };
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };
export const statusBadge = (v) => ({ todo: 'bg-slate-200 text-slate-700', in_progress: 'bg-blue-100 text-blue-800', done: 'bg-green-100 text-green-800' }[v] || 'bg-slate-100');
export const priorityBadge = (v) => ({ low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-800', high: 'bg-red-100 text-red-800' }[v] || 'bg-slate-100');
export const isOverdue = (t) => Boolean(t.due_date && t.status !== 'done' && String(t.due_date).slice(0, 10) < new Date().toISOString().slice(0, 10));
export const fmtDate = (d) => d ? String(d).slice(0, 10) : '-';
export const initials = (name = '') => name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() || '?';
