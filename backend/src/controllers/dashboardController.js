
const db = require('../db');
// GET /api/dashboard — real counts for the current user (no hardcoded numbers on the frontend)
exports.dashboard = async (req, res) => {
  const uid = req.user.id;
  const [tasks, teams, reminders] = await Promise.all([db.listTasks(uid, {}), db.listTeamsForUser(uid), db.remindersForUser(uid)]);
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (t) => t.due_date && t.status !== 'done' && String(t.due_date).slice(0, 10) < today;
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'done').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(isOverdue).length,
    my_tasks: tasks.filter(t => t.assigned_to === Number(uid)).length,
    teams: teams.length,
  };
  const recent_tasks = [...tasks].sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at))).slice(0, 5);
  const my_tasks = tasks.filter(t => t.assigned_to === Number(uid)).slice(0, 5);
  res.json({ stats, recent_tasks, my_tasks, teams, reminders });
};
