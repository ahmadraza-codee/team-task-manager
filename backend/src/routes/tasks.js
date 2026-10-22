
const express = require('express');
const { taskValidators, taskPatchValidators, taskQueryValidators, handleValidation, idParam } = require('../validators');
const c = require('../controllers/taskController');
const router = express.Router();
// Bonus: due-date reminders - must be before /:id
router.get('/reminders', c.reminders);
router.get('/', taskQueryValidators, handleValidation, c.listTasks);
router.post('/', taskValidators, handleValidation, c.createTask);
router.get('/:id', idParam, handleValidation, c.getTask);
router.put('/:id', idParam, taskValidators, handleValidation, c.updateTask);
router.patch('/:id', idParam, taskPatchValidators, handleValidation, c.updateTask);
router.delete('/:id', idParam, handleValidation, c.deleteTask);
module.exports = router;
