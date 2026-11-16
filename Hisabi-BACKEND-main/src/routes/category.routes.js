'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/category.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color.'),
    body('monthly_budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number.'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense.'),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color.'),
    body('monthly_budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number.'),
  ],
  validate,
  ctrl.update
);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['income', 'expense']),
    body('monthly_budget').optional().isFloat({ min: 0 }),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;
