'use strict';

const router = require('express').Router();

router.use('/auth',          require('./auth.routes'));
router.use('/categories',    require('./category.routes'));
router.use('/transactions',  require('./transaction.routes'));
router.use('/subscriptions', require('./subscription.routes'));
router.use('/alerts',        require('./alert.routes'));
router.use('/reports',       require('./report.routes'));
router.use('/brands',        require('./brand.routes'));
router.use('/budgets',       require('./budget.routes'));
router.use('/activity-logs', require('./activitylog.routes'));

module.exports = router;
