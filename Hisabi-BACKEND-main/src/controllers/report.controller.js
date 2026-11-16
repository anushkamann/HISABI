'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ReportService = require('../services/report.service');

const _yearMonth = (query) => {
  const now = new Date();
  const year  = parseInt(query.year,  10) || now.getFullYear();
  const month = parseInt(query.month, 10) || now.getMonth() + 1;
  return { year, month };
};

const monthlySummary = asyncHandler(async (req, res) => {
  const { year, month } = _yearMonth(req.query);
  const summary = await ReportService.monthlySummary(req.user.id, year, month);
  res.json({ success: true, summary });
});

const categoryAnalytics = asyncHandler(async (req, res) => {
  const { year, month } = _yearMonth(req.query);
  const analytics = await ReportService.categoryAnalytics(req.user.id, year, month);
  res.json({ success: true, analytics });
});

const trend = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months, 10) || 6;
  const data = await ReportService.trend(req.user.id, months);
  res.json({ success: true, trend: data });
});

const subscriptionSummary = asyncHandler(async (req, res) => {
  const summary = await ReportService.subscriptionSummary(req.user.id);
  res.json({ success: true, summary });
});

module.exports = { monthlySummary, categoryAnalytics, trend, subscriptionSummary };
