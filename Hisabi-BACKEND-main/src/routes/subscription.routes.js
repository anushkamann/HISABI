'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/subscription.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.'),
    body('billing_cycle')
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('billing_cycle must be weekly, monthly, or yearly.'),
    body('next_billing_date').isDate().withMessage('next_billing_date must be a valid date.'),
    body('category_id').optional().isInt(),
    body('notes').optional().isString(),
  ],
  validate,
  ctrl.create
);

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('billing_cycle').optional().isIn(['weekly', 'monthly', 'yearly']),
  body('next_billing_date').optional().isDate(),
  body('category_id').optional().isInt(),
  body('is_active').optional().isBoolean(),
];

router.put('/:id', updateRules, validate, ctrl.update);
router.patch('/:id', updateRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
