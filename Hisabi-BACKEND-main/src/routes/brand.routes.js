'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/brand.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/category/:categoryId', ctrl.getByCategory);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('category_id').optional().isInt().withMessage('category_id must be an integer.'),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('category_id').optional().isInt().withMessage('category_id must be an integer.'),
  ],
  validate,
  ctrl.update
);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('category_id').optional().isInt(),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;