
const express = require('express');
const { body } = require('express-validator');
const { teamValidators, teamPatchValidators, handleValidation, idParam } = require('../validators');
const { requireTeamMember } = require('../middleware/auth');
const c = require('../controllers/teamController');
const router = express.Router();
router.get('/', c.listTeams);
router.post('/', teamValidators, handleValidation, c.createTeam);
router.get('/:id/members', idParam, handleValidation, requireTeamMember, c.getMembers);
router.get('/:id', idParam, handleValidation, requireTeamMember, c.getTeam);
router.put('/:id', idParam, teamValidators, handleValidation, requireTeamMember, c.updateTeam);
router.patch('/:id', idParam, teamPatchValidators, handleValidation, requireTeamMember, c.updateTeam);
router.delete('/:id', idParam, handleValidation, requireTeamMember, c.deleteTeam);
router.post('/:id/members', idParam, [body('email').optional().trim().isEmail().normalizeEmail(), body('user_id').optional().isInt()], handleValidation, requireTeamMember, c.addMember);
router.delete('/:id/members/:userId', requireTeamMember, c.removeMember);
router.post('/:id/invite', idParam, [body('email').trim().isEmail().normalizeEmail()], handleValidation, requireTeamMember, c.invite);
module.exports = router;
