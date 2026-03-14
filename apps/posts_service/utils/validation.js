import Joi from 'joi';

export const templateValidation = {
  createTemplate: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().allow('').max(500),
    is_public: Joi.boolean().required(),
    fields: Joi.array().items(
      Joi.object({
        name: Joi.string().required().pattern(/^[a-zA-Z0-9_]+$/),
        label: Joi.string().required(),
        type: Joi.string().valid('text', 'number', 'date', 'select'),
        placeholder: Joi.string().allow(''),
        is_required: Joi.boolean(),
        validations: Joi.object()
      })
    ),
    content: Joi.string().required(),
    editor_state: Joi.string().required()
  }),

  updateEntry: Joi.object({
    id: Joi.string().required(),
    status: Joi.string().valid('draft', 'pending_review', 'approved', 'rejected'),
    review_notes: Joi.string().allow('')
  })
};