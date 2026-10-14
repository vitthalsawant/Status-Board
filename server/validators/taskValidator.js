const Joi = require('joi');

const STATUSES = ['To-Do', 'In-Progress', 'Done'];

const objectId = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid task id',
    'string.empty': 'Task id is required',
    'any.required': 'Task id is required',
  });

const createTaskSchema = Joi.object({
  title: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': 'Status must be To-Do, In-Progress, or Done',
    }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().max(100).optional().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': 'Status must be To-Do, In-Progress, or Done',
    }),
})
  .min(1)
  .messages({
    'object.min': 'Provide at least one field to update',
  });

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .required()
    .messages({
      'any.only': 'Status must be To-Do, In-Progress, or Done',
      'string.empty': 'Status is required',
      'any.required': 'Status is required',
    }),
});

const idParamSchema = Joi.object({
  id: objectId,
});

const listQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': 'Status must be To-Do, In-Progress, or Done',
    }),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  statusSchema,
  idParamSchema,
  listQuerySchema,
};
