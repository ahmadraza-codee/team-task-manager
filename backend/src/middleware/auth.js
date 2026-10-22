
const db = require('../db');
function requireAuth(req, res, next){ if (req.isAuthenticated && req.isAuthenticated()) return next(); return res.status(401).json({ error: 'Authentication required' }); }
async function requireTeamMember(req, res, next){
  const teamId = req.params.id || req.body.team_id || req.query.teamId;
  if (!teamId) return next();
  if (!(await db.isMember(teamId, req.user.id))) return res.status(403).json({ error: 'You are not a member of this team' });
  next();
}
module.exports = { requireAuth, requireTeamMember };
