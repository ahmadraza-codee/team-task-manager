
const express = require('express'); const db = require('../db');
const { taskValidators, taskQueryValidators, handleValidation, idParam } = require('../validators'); const { requireTeamMember } = require('../middleware/auth');
const router = express.Router();
// Bonus: due-date reminders (due today + overdue, for current user) - must be before /:id
router.get('/reminders', async (req,res)=> res.json(await db.remindersForUser(req.user.id)));
router.get('/', taskQueryValidators, handleValidation, async (req,res)=> res.json({ tasks: await db.listTasks(req.user.id, req.query) }));
router.post('/', taskValidators, handleValidation, async (req,res)=>{ if(!(await db.isMember(req.body.team_id, req.user.id))) return res.status(403).json({error:'Not a team member'}); if(req.body.assigned_to && !(await db.isMember(req.body.team_id, req.body.assigned_to))) return res.status(400).json({error:'Assignee must be a team member'}); const due = req.body.due_date ? new Date(req.body.due_date).toISOString().slice(0,10) : null; res.status(201).json({ task: await db.createTask({...req.body, due_date:due, created_by:req.user.id}) }); });
router.get('/:id', idParam, handleValidation, async (req,res)=>{ const t=await db.getTask(req.params.id); if(!t||!(await db.isMember(t.team_id, req.user.id))) return res.status(404).json({error:'Task not found'}); res.json({task:t}); });
router.put('/:id', idParam, taskValidators, handleValidation, async (req,res)=>{ const old=await db.getTask(req.params.id); if(!old||!(await db.isMember(old.team_id, req.user.id))) return res.status(404).json({error:'Task not found'}); const due=req.body.due_date?new Date(req.body.due_date).toISOString().slice(0,10):null; res.json({ task: await db.updateTask(req.params.id, {...old, ...req.body, due_date:due}) }); });
router.delete('/:id', idParam, handleValidation, async (req,res)=>{ const t=await db.getTask(req.params.id); if(!t||!(await db.isMember(t.team_id, req.user.id))) return res.status(404).json({error:'Task not found'}); await db.deleteTask(t.id); res.json({message:'Task deleted'}); });
module.exports = router;
