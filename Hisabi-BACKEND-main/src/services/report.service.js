'use strict';

const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');

const ReportService = {
  async monthlySummary(userId, year, month) {
    const rows = await Transaction.monthlySummary(userId, year, month);

    let income = 0, expense = 0;
    rows.forEach((r) => {
      if (r.type === 'income')  income  = parseFloat(r.total);
      if (r.type === 'expense') expense = parseFloat(r.total);
    });

    const net = income - expense;
    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(2) : '0.00';

    return {
      year,
      month,
      income,
      expense,
      net,
      savingsRate: parseFloat(savingsRate),
      transactionCounts: rows.reduce((acc, r) => {
        acc[r.type] = parseInt(r.count, 10);
        return acc;
      }, {}),
    };
  },

  async categoryAnalytics(userId, year, month) {
    const rows = await Transaction.categorySpendingByMonth(userId, year, month);
    return rows.map((r) => ({
      ...r,
      total_spent: parseFloat(r.total_spent),
      monthly_budget: r.monthly_budget ? parseFloat(r.monthly_budget) : null,
      budget_usage_pct: r.monthly_budget
        ? parseFloat(((r.total_spent / r.monthly_budget) * 100).toFixed(2))
        : null,
      is_over_budget: r.monthly_budget ? parseFloat(r.total_spent) > parseFloat(r.monthly_budget) : false,
    }));
  },

  async trend(userId, months) {
    const rows = await Transaction.monthlyTrend(userId, months || 6);

    // Pivot to { month: { income, expense } }
    const map = {};
    rows.forEach(({ month, type, total }) => {
      if (!map[month]) map[month] = { month, income: 0, expense: 0 };
      map[month][type] = parseFloat(total);
    });

    const trend = Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
    trend.forEach((m) => { m.net = m.income - m.expense; });

    return trend;
  },

  async subscriptionSummary(userId) {
    const monthlyEquivalent = await Subscription.totalMonthlySpend(userId);
    const subs = await Subscription.findAll(userId);
    return {
      total_active: subs.filter((s) => s.is_active).length,
      monthly_equivalent: parseFloat(parseFloat(monthlyEquivalent).toFixed(2)),
      annual_equivalent: parseFloat((parseFloat(monthlyEquivalent) * 12).toFixed(2)),
      subscriptions: subs,
    };
  },
};

module.exports = ReportService;
