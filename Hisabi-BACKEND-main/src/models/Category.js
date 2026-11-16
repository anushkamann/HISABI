'use strict';

const { pool } = require('../config/db');

const Category = {
  async findAll(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ name, type, color, monthly_budget, user_id }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, type, color, monthly_budget, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, type, color || '#6366f1', monthly_budget || null, user_id]
    );
    return result.insertId;
  },

  async update(id, userId, { name, type, color, monthly_budget }) {
    const [result] = await pool.query(
      `UPDATE categories
          SET name = COALESCE(?, name),
              type = COALESCE(?, type),
              color = COALESCE(?, color),
              monthly_budget = COALESCE(?, monthly_budget)
        WHERE id = ? AND user_id = ?`,
      [name, type, color, monthly_budget, id, userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },
};

module.exports = Category;
