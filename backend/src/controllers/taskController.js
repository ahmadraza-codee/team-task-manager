
const db = require('../db');
const normDue = (v) => v ? new Date(v).toISOString().slice(0, 10) : null;

exports.reminders = async (req, res) => res.json(await db.remindersForUser(req.user.id));
exports.listTasks = async (req, res) => res.json({ tasks: await db.listTasks(req.user.id, req.query) });
exports.createTask = async (req, res) => {
  if (!(await db.isMember(req.body.team_id, req.user.id))) return res.status(403).json({ error: 'You are not a member of this team' });
  if (req.body.assigned_to && !(await db.isMember(req.body.team_id, req.body.assigned_to))) return res.status(400).json({ error: 'Assignee must be a team member' });
  const task = await db.createTask({ ...req.body, due_date: normDue(req.body.due_date), created_by: req.user.id });
  res.status(201).json({ task });
};
exports.getTask = async (req, res) => {
  const t = await db.getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'Task not found' });
  if (!(await db.isMember(t.team_id, req.user.id))) return res.status(403).json({ error: 'You are not a member of this team' });
  res.json({ task: t });
};
exports.updateTask = async (req, res) => {
  const old = await db.getTask(req.params.id);
  if (!old) return res.status(404).json({ error: 'Task not found' });
  if (!(await db.isMember(old.team_id, req.user.id))) return res.status(403).json({ error: 'You are not a member of this team' });
  const merged = { ...old, ...req.body };
  if (merged.team_id && Number(merged.team_id) !== Number(old.team_id) && !(await db.isMember(merged.team_id, req.user.id))) return res.status(403).json({ error: 'You are not a member of the target team' });
  if (merged.assigned_to && !(await db.isMember(merged.team_id, merged.assigned_to))) return res.status(400).json({ error: 'Assignee must be a team member' });
  const task = await db.updateTask(req.params.id, { ...merged, due_date: normDue(merged.due_date) });
  res.json({ task });
};
exports.deleteTask = async (req, res) => {
  const t = await db.getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'Task not found' });
  if (!(await db.isMember(t.team_id, req.user.id))) return res.status(403).json({ error: 'You are not a member of this team' });
  await db.deleteTask(t.id);
  res.json({ message: 'Task deleted' });
};
