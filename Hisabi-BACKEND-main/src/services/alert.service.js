'use strict';

const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');

/**
 * After each expense transaction, check whether the category's
 * monthly spending has crossed the monthly_budget threshold.
 * If it has and no alert exists for this month yet, create one.
 */
const AlertService = {
  async checkOverspending(userId, categoryId, year, month) {
    if (!categoryId) return;

    const spending = await Transaction.categorySpendingByMonth(userId, year, month);
    const cat = spending.find((c) => c.category_id === categoryId);

    if (!cat || !cat.monthly_budget) return; // no budget set → nothing to check

    const budget = parseFloat(cat.monthly_budget);
    const spent  = parseFloat(cat.total_spent);

    if (spent > budget) {
      const alreadyAlerted = await Alert.existsForMonth(userId, categoryId, year, month);
      if (!alreadyAlerted) {
        await Alert.create({
          user_id: userId,
          category_id: categoryId,
          type: 'overspending',
          message: `You have exceeded your monthly budget for "${cat.category_name}". Budget: ${budget}, Spent: ${spent.toFixed(2)}.`,
          threshold: budget,
          actual_amount: spent,
        });
      }
    }
  },
};

module.exports = AlertService;
