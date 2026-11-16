'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

const AuthService = {
  async register({ name, email, password }) {
    const existing = await User.findByEmail(email);
    if (existing) throw new ApiError(409, 'An account with that email already exists.');

    const id = await User.create({ name, email, password });
    const user = await User.findById(id);

    // Seed default categories
    const defaultCategories = [
      [id, 'Food', 'expense', '#f97316'],
      [id, 'Transport', 'expense', '#8b5cf6'],
      [id, 'Entertainment', 'expense', '#ec4899'],
      [id, 'Health', 'expense', '#ef4444'],
      [id, 'Technology', 'expense', '#06b6d4'],
      [id, 'Investment', 'expense', '#10b981'],
      [id, 'Salary', 'income', '#22c55e'],
      [id, 'Freelance', 'income', '#3b82f6'],
      [id, 'Housing', 'expense', '#64748b'],
      [id, 'Shopping', 'expense', '#f59e0b'],
      [id, 'Other', 'expense', '#9ca3af']
    ];

    await pool.query(
      'INSERT INTO categories (user_id, name, type, color) VALUES ?',
      [defaultCategories]
    );

    const token = AuthService._signToken(user);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) throw new ApiError(401, 'Invalid email or password.');

    if (password !== user.password) throw new ApiError(401, 'Invalid email or password.');

    const { password: _pw, ...safeUser } = user;
    const token = AuthService._signToken(safeUser);
    return { user: safeUser, token };
  },

  _signToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
  },
};

module.exports = AuthService;
