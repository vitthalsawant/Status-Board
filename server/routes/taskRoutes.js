const express = require('express');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  statusSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/taskValidator');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(validate(listQuerySchema, 'query'), getTasks)
  .post(validate(createTaskSchema), createTask);

router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(statusSchema),
  updateTaskStatus
);

router
  .route('/:id')
  .get(validate(idParamSchema, 'params'), getTask)
  .put(validate(idParamSchema, 'params'), validate(updateTaskSchema), updateTask)
  .delete(validate(idParamSchema, 'params'), deleteTask);

module.exports = router;
