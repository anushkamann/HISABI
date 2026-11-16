'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/activitylog.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('action').trim().notEmpty().withMessage('Action is required.'),
    body('description').optional().trim(),
  ],
  validate,
  ctrl.create
);

router.delete('/:id', ctrl.remove);

module.exports = router;