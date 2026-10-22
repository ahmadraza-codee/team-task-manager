
const { body, param, query, validationResult } = require('express-validator');
function handleValidation(req, res, next) { const r = validationResult(req); if (!r.isEmpty()) return res.status(400).json({ errors: r.array().map(e => ({ field: e.path, message: e.msg })) }); next(); }
const STATUSES = ['todo', 'in_progress', 'done']; const PRIORITIES = ['low', 'medium', 'high'];
module.exports = {
  handleValidation,
  registerValidators: [body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }), body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  loginValidators: [body('email').trim().isEmail().normalizeEmail(), body('password').notEmpty()],
  teamValidators: [body('name').trim().notEmpty().withMessage('Team name required').isLength({ max: 160 }), body('description').optional().trim().isLength({ max: 1000 })],
  teamPatchValidators: [body('name').optional().trim().notEmpty().isLength({ max: 160 }), body('description').optional().trim().isLength({ max: 1000 })],
  taskValidators: [
    body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(STATUSES), body('priority').optional().isIn(PRIORITIES),
    body('due_date').optional({ nullable: true }).isISO8601(),
    body('team_id').notEmpty().isInt(), body('assigned_to').optional({ nullable: true }).isInt(),
  ],
  taskPatchValidators: [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(STATUSES), body('priority').optional().isIn(PRIORITIES),
    body('due_date').optional({ nullable: true }).isISO8601(),
    body('team_id').optional().isInt(), body('assigned_to').optional({ nullable: true }).isInt(),
  ],
  idParam: [param('id').isInt().withMessage('Invalid id')],
  taskQueryValidators: [query('status').optional().isIn(STATUSES), query('priority').optional().isIn(PRIORITIES), query('teamId').optional().isInt(), query('assignee').optional().isInt(), query('assigneeId').optional().isInt(), query('search').optional().trim().isLength({ max: 200 })],
};
