'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/reports/monthly?year=2025&month=4
router.get('/monthly', ctrl.monthlySummary);

// GET /api/reports/categories?year=2025&month=4
router.get('/categories', ctrl.categoryAnalytics);

// GET /api/reports/trend?months=6
router.get('/trend', ctrl.trend);

// GET /api/reports/subscriptions
router.get('/subscriptions', ctrl.subscriptionSummary);

module.exports = router;
