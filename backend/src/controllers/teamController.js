
const db = require('../db');

exports.listTeams = async (req, res) => res.json({ teams: await db.listTeamsForUser(req.user.id), users: await db.listUsers() });
exports.createTeam = async (req, res) => res.status(201).json({ team: await db.createTeam({ ...req.body, created_by: req.user.id }) });
exports.getTeam = async (req, res) => {
  const t = await db.getTeam(req.params.id);
  if (!t) return res.status(404).json({ error: 'Team not found' });
  res.json({ team: t, members: await db.getMembers(t.id), invites: await db.listInvites(t.id) });
};
exports.updateTeam = async (req, res) => {
  const t = await db.getTeam(req.params.id);
  if (!t) return res.status(404).json({ error: 'Team not found' });
  const merged = { name: req.body.name ?? t.name, description: req.body.description ?? t.description };
  res.json({ team: await db.updateTeam(req.params.id, merged) });
};
// Role-based access: ONLY the team creator/owner can delete a team
exports.deleteTeam = async (req, res) => {
  const t = await db.getTeam(req.params.id);
  if (!t) return res.status(404).json({ error: 'Team not found' });
  if (t.created_by !== req.user.id) return res.status(403).json({ error: 'Only the team creator can delete this team' });
  await db.deleteTeam(t.id);
  res.json({ message: 'Team deleted' });
};
exports.getMembers = async (req, res) => res.json({ members: await db.getMembers(req.params.id) });
// Add a member by registered user's email (preferred) or by user_id (kept for compatibility)
exports.addMember = async (req, res) => {
  let u = null;
  if (req.body.email) u = await db.findUserByEmail(String(req.body.email).trim().toLowerCase());
  else if (req.body.user_id) u = await db.findUserById(req.body.user_id);
  if (!u) return res.status(404).json({ error: 'User not found - no registered user with that email' });
  res.json({ members: await db.addMember(req.params.id, u.id) });
};
exports.removeMember = async (req, res) => {
  const t = await db.getTeam(req.params.id);
  if (!t) return res.status(404).json({ error: 'Team not found' });
  if (Number(req.params.userId) === t.created_by) return res.status(400).json({ error: 'Owner cannot be removed' });
  await db.removeMember(req.params.id, req.params.userId);
  res.json({ members: await db.getMembers(req.params.id) });
};
// Bonus: invite via email (stubbed, no SMTP)
exports.invite = async (req, res) => {
  const invite = await db.createInvite({ team_id: req.params.id, email: req.body.email, invited_by: req.user.id });
  res.status(201).json({ invite, message: `Invite stub created for ${req.body.email} (no email sent - stubbed logic)` });
};
