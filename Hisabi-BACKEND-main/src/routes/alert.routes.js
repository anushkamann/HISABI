'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/alert.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('type').notEmpty().withMessage('Alert type is required.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
    body('category_id').optional().isInt(),
    body('threshold').optional().isFloat({ min: 0 }),
    body('actual_amount').optional().isFloat({ min: 0 }),
  ],
  validate,
  ctrl.create
);

// Mark a single alert as read
router.patch('/:id/read', ctrl.markRead);

// Mark ALL alerts as read
router.patch('/read-all', ctrl.markAllRead);

router.put('/:id/read', ctrl.markRead);

router.delete('/:id', ctrl.remove);

module.exports = router;
