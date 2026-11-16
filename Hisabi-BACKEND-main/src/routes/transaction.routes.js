'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/transaction.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('type').optional(),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.'),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('date').optional().isDate(),
    body('transaction_date').optional().isDate(),
    body('category').optional().notEmpty(),
    body('category_id').optional().isInt(),
    body('brand_id').optional().isInt(),
    body('note').optional().isString(),
    body('status').optional().isIn(['completed', 'pending'])
  ],
  validate,
  ctrl.create
);

const updateRules = [
  body('type').optional(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('date').optional().isDate(),
  body('transaction_date').optional().isDate(),
  body('category').optional().notEmpty(),
  body('category_id').optional().isInt(),
  body('brand_id').optional().isInt(),
  body('note').optional().isString(),
  body('status').optional().isIn(['completed', 'pending'])
];

router.put('/:id', updateRules, validate, ctrl.update);
router.patch('/:id', updateRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
