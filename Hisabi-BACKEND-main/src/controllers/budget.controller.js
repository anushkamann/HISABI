'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Budget = require('../models/Budget');
const ApiError = require('../utils/ApiError');

const { pool } = require('../config/db');

const getAll = asyncHandler(async (req, res) => {
  const budgets = await Budget.findAll(req.user.id);
  // Transform to what frontend expects if needed, else leave as is.
  const mappedBudgets = budgets.map(b => ({
    ...b,
    category: b.category_name,
    limit: b.amount,
    spent: b.spent
  }));
  res.json({ success: true, budgets: mappedBudgets });
});

const getOne = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id, req.user.id);
  if (!budget) throw new ApiError(404, 'Budget not found.');
  res.json({ success: true, budget });
});

const create = asyncHandler(async (req, res) => {
  let category_val = req.body.category || req.body.category_id;
  const amount_val = req.body.limit || req.body.amount;
  const year_val = req.body.year || new Date().getFullYear();

  if (!category_val || !amount_val) {
    throw new ApiError(400, 'category/category_id and limit/amount are required.');
  }

  // If category is provided as a name string instead of an ID, find the real category_id
  if (isNaN(category_val)) {
    const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? AND user_id = ? LIMIT 1', [category_val, req.user.id]);
    if (rows.length > 0) {
      category_val = rows[0].id;
    } else {
      // automatically create the category if it doesn't exist?
      const [insertResult] = await pool.query('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)', [req.user.id, category_val, 'expense']);
      category_val = insertResult.insertId;
    }
  }

  // Check if budget already exists
  const existing = await Budget.findByCategoryYear(req.user.id, category_val, year_val);
  if (existing) {
    await Budget.update(existing.id, req.user.id, { amount: amount_val });
    const budget = await Budget.findById(existing.id, req.user.id);
    return res.status(200).json({ success: true, message: 'Budget updated.', budget });
  }

  const id = await Budget.create({ user_id: req.user.id, category_id: category_val, year: year_val, amount: amount_val });
  const budget = await Budget.findById(id, req.user.id);
  res.status(201).json({ success: true, message: 'Budget created.', budget });
});

const update = asyncHandler(async (req, res) => {
  const amount_val = req.body.limit || req.body.amount;
  const category_val = req.body.category || req.body.category_id;
  
  let final_category_id = category_val;
  // If category is a name string, find its ID
  if (category_val && isNaN(category_val)) {
    const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? AND user_id = ? LIMIT 1', [category_val, req.user.id]);
    if (rows.length > 0) {
      final_category_id = rows[0].id;
    }
  }

  const payload = {
    category_id: final_category_id,
    year: req.body.year,
    amount: amount_val,
  };

  const affected = await Budget.update(req.params.id, req.user.id, payload);
  if (!affected) throw new ApiError(404, 'Budget not found.');
  const budget = await Budget.findById(req.params.id, req.user.id);
  res.json({ success: true, message: 'Budget updated.', budget });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Budget.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Budget not found.');
  res.json({ success: true, message: 'Budget deleted.' });
});

module.exports = { getAll, getOne, create, update, remove };