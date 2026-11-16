'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/budget.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('category').optional().notEmpty().withMessage('category is required.'),
    body('category_id').optional().isInt(),
    body('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100.'),
    body('limit').optional().isFloat({ gt: 0 }),
    body('amount').optional().isFloat({ gt: 0 }),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('category').optional().notEmpty().withMessage('category is required.'),
    body('category_id').optional().isInt().withMessage('category_id must be an integer.'),
    body('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100.'),
    body('limit').optional().isFloat({ gt: 0 }).withMessage('limit must be greater than 0.'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.'),
  ],
  validate,
  ctrl.update
);

router.patch(
  '/:id',
  [
    body('category').optional().notEmpty(),
    body('category_id').optional().isInt(),
    body('year').optional().isInt({ min: 2000, max: 2100 }),
    body('limit').optional().isFloat({ gt: 0 }),
    body('amount').optional().isFloat({ gt: 0 }),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;