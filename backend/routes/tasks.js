const express = require('express');
const router  = express.Router();

const { getAllTasks, addTask, updateTask, deleteTask, toggleTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/* Flat list of all tasks */
router.get('/tasks', getAllTasks);

/* Tasks nested under a bucket */
router.post('/buckets/:bucketId/tasks',                    addTask);
router.put('/buckets/:bucketId/tasks/:taskId',             updateTask);
router.delete('/buckets/:bucketId/tasks/:taskId',          deleteTask);
router.patch('/buckets/:bucketId/tasks/:taskId/toggle',    toggleTask);

module.exports = router;
