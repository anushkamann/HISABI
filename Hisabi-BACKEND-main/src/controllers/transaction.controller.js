'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Transaction = require('../models/Transaction');
const AlertService = require('../services/alert.service');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const { type, category_id, start_date, end_date, limit = 50, page = 1 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const filters = { type, category_id, start_date, end_date, limit, offset };

  const [transactions, total] = await Promise.all([
    Transaction.findAll(req.user.id, filters),
    Transaction.count(req.user.id, filters),
  ]);

  const mappedTransactions = transactions.map(tx => ({
    id: tx.id,
    title: tx.description,
    amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    type: tx.type,
    category: tx.category_name, // frontend expects category name or object
    date: tx.transaction_date,
    status: 'completed', // Frontend requested this field, hardcoding if not in DB
    userId: tx.user_id
  }));

  res.json({
    success: true,
    transactions: mappedTransactions,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id, req.user.id);
  if (!tx) throw new ApiError(404, 'Transaction not found.');
  res.json({ 
    success: true, 
    transaction: {
      id: tx.id,
      title: tx.description,
      amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
      type: tx.type,
      category: tx.category_name,
      date: tx.transaction_date,
      status: 'completed',
      userId: tx.user_id
    } 
  });
});

const create = asyncHandler(async (req, res) => {
  // Allow front-end keys as fallbacks
  const _title = req.body.title || req.body.description;
  const _date = req.body.date || req.body.transaction_date || new Date().toISOString().split('T')[0];
  const _category = req.body.category || req.body.category_id;
  const _amount = req.body.amount;
  const incomingType = (req.body.type || '').toLowerCase();
  // Any UI add-expense action should fall to expense, explicitly require 'income'
  const _type = incomingType === 'income' ? 'income' : 'expense';

  // Attempt to resolve custom string category if provided
  let cat_id = parseInt(_category, 10);
  if (isNaN(cat_id) && _category) {
      const { pool } = require('../config/db');
      const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? AND user_id = ? LIMIT 1', [_category, req.user.id]);
      if (rows.length > 0) {
        cat_id = rows[0].id;
      } else {
        const [insertResult] = await pool.query('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)', [req.user.id, _category, _type]);
        cat_id = insertResult.insertId;
      }
  }

  const id = await Transaction.create({
    user_id: req.user.id,
    category_id: cat_id || null,
    brand_id: req.body.brand_id,
    type: _type,
    amount: _amount,
    description: _title,
    transaction_date: _date,
    note: req.body.note,
  });

  const tx = await Transaction.findById(id, req.user.id);

  // Auto-detect overspending after an expense is recorded
  if (tx.type === 'expense' && tx.category_id) {
    const d = new Date(tx.transaction_date);
    await AlertService.checkOverspending(req.user.id, tx.category_id, d.getFullYear(), d.getMonth() + 1);
  }

  res.status(201).json({ 
    success: true, 
    message: 'Transaction created.', 
    transaction: {
      id: tx.id,
      title: tx.description,
      amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
      type: tx.type,
      category: tx.category_name,
      date: tx.transaction_date,
      status: 'completed',
      userId: tx.user_id
    }
  });
});

const update = asyncHandler(async (req, res) => {
  const _title = req.body.title || req.body.description;
  const _date = req.body.date || req.body.transaction_date;
  const _category = req.body.category || req.body.category_id;
  const incomingType = (req.body.type || '').toLowerCase();
  const _type = req.body.type ? (incomingType === 'income' ? 'income' : 'expense') : undefined;
  
  let cat_id = undefined;
  if (_category !== undefined) {
    cat_id = parseInt(_category, 10);
    if (isNaN(cat_id)) {
        const { pool } = require('../config/db');
        const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? AND user_id = ? LIMIT 1', [_category, req.user.id]);
        if (rows.length > 0) { cat_id = rows[0].id; }
    }
  }

  const payload = {
    ...req.body,
  };
  if (_title) payload.description = _title;
  if (_date) payload.transaction_date = _date;
  if (cat_id !== undefined) payload.category_id = cat_id;
  if (_type) payload.type = _type;

  const affected = await Transaction.update(req.params.id, req.user.id, payload);
  if (!affected) throw new ApiError(404, 'Transaction not found.');
  const tx = await Transaction.findById(req.params.id, req.user.id);

  // Re-check overspending after update
  if (tx.type === 'expense' && tx.category_id) {
    const d = new Date(tx.transaction_date);
    await AlertService.checkOverspending(
      req.user.id, tx.category_id, d.getFullYear(), d.getMonth() + 1
    );
  }

  res.json({ 
    success: true, 
    message: 'Transaction updated.', 
    transaction: {
      id: tx.id,
      title: tx.description,
      amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
      type: tx.type,
      category: tx.category_name,
      date: tx.transaction_date,
      status: 'completed',
      userId: tx.user_id
    } 
  });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Transaction.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Transaction not found.');
  res.json({ success: true, message: 'Transaction deleted.' });
});

module.exports = { getAll, getOne, create, update, remove };
