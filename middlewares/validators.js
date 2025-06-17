// middlewares/validators.js
const { body, validationResult } = require('express-validator');

// Validation rules for creating a blog
const createBlogValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
];

// Validation rules for updating a blog
const updateBlogValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('body').optional().notEmpty().withMessage('Body cannot be empty'),
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createBlogValidation,
  updateBlogValidation,
  handleValidationErrors,
};
