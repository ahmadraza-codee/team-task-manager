
const express = require('express'); const db = require('../db');
const { teamValidators, handleValidation, idParam } = require('../validators'); const { body } = require('express-validator');
const { requireTeamMember } = require('../middleware/auth');
const router = express.Router();
router.get('/', async (req,res)=> res.json({ teams: await db.listTeamsForUser(req.user.id), users: await db.listUsers() }));
router.post('/', teamValidators, handleValidation, async (req,res)=> res.status(201).json({ team: await db.createTeam({ ...req.body, created_by: req.user.id }) }));
router.get('/:id', idParam, handleValidation, requireTeamMember, async (req,res)=>{ const t=await db.getTeam(req.params.id); if(!t) return res.status(404).json({error:'Team not found'}); res.json({ team:t, members: await db.getMembers(t.id), invites: await db.listInvites(t.id) }); });
router.put('/:id', idParam, teamValidators, handleValidation, requireTeamMember, async (req,res)=> res.json({ team: await db.updateTeam(req.params.id, req.body) }));
// Role-based access: ONLY the team creator/owner can delete a team
router.delete('/:id', idParam, handleValidation, requireTeamMember, async (req,res)=>{ const t=await db.getTeam(req.params.id); if(!t) return res.status(404).json({error:'Team not found'}); if(t.created_by!==req.user.id) return res.status(403).json({error:'Only the team creator can delete this team'}); await db.deleteTeam(t.id); res.json({message:'Team deleted'}); });
router.post('/:id/members', idParam, [body('user_id').isInt()], handleValidation, requireTeamMember, async (req,res)=>{ const u=await db.findUserById(req.body.user_id); if(!u) return res.status(404).json({error:'User not found'}); res.json({ members: await db.addMember(req.params.id, u.id) }); });
router.delete('/:id/members/:userId', requireTeamMember, async (req,res)=>{ const t=await db.getTeam(req.params.id); if(Number(req.params.userId)===t.created_by) return res.status(400).json({error:'Owner cannot be removed'}); await db.removeMember(req.params.id, req.params.userId); res.json({ members: await db.getMembers(req.params.id) }); });
// Bonus: invite via email (stubbed, no SMTP)
router.post('/:id/invite', idParam, [body('email').trim().isEmail().normalizeEmail()], handleValidation, requireTeamMember, async (req,res)=>{ const invite=await db.createInvite({team_id:req.params.id, email:req.body.email, invited_by:req.user.id}); res.status(201).json({ invite, message: `Invite stub created for ${req.body.email} (no email sent - stubbed logic)` }); });
module.exports = router;
