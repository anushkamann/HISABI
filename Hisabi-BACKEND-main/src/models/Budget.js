'use strict';

const { pool } = require('../config/db');

const Budget = {
  async findAll(userId) {
    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name, c.color AS category_color,
              COALESCE(SUM(t.amount), 0) AS spent
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         LEFT JOIN transactions t ON t.category_id = b.category_id
                                  AND t.user_id = b.user_id
                                  AND t.type = 'expense'
                                  AND YEAR(t.transaction_date) = b.year
        WHERE b.user_id = ?
        GROUP BY b.id
        ORDER BY b.year DESC, c.name ASC`,
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name,
              COALESCE(SUM(t.amount), 0) AS spent
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         LEFT JOIN transactions t ON t.category_id = b.category_id
                                  AND t.user_id = b.user_id
                                  AND t.type = 'expense'
                                  AND YEAR(t.transaction_date) = b.year
        WHERE b.id = ? AND b.user_id = ?
        GROUP BY b.id
        LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async findByCategoryYear(userId, categoryId, year) {
    const [rows] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND year = ? LIMIT 1',
      [userId, categoryId, year]
    );
    return rows[0] || null;
  },

  async create({ user_id, category_id, year, amount }) {
    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, category_id, year, amount) VALUES (?, ?, ?, ?)',
      [user_id, category_id, year, amount]
    );
    return result.insertId;
  },

  async update(id, userId, { category_id, year, amount }) {
    const [result] = await pool.query(
      'UPDATE budgets SET category_id = COALESCE(?, category_id), year = COALESCE(?, year), amount = COALESCE(?, amount) WHERE id = ? AND user_id = ?',
      [category_id, year, amount, id, userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows;
  },
};

module.exports = Budget;