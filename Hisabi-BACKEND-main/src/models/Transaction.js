'use strict';

const { pool } = require('../config/db');

const Transaction = {
  async findAll(userId, { type, category_id, start_date, end_date, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.type AS category_type,
             b.name AS brand_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN brands b ON t.brand_id = b.id
       WHERE t.user_id = ?`;
    const params = [userId];

    if (type) { sql += ' AND t.type = ?'; params.push(type); }
    if (category_id) { sql += ' AND t.category_id = ?'; params.push(category_id); }
    if (start_date) { sql += ' AND t.transaction_date >= ?'; params.push(start_date); }
    if (end_date)   { sql += ' AND t.transaction_date <= ?'; params.push(end_date); }

    sql += ' ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async count(userId, { type, category_id, start_date, end_date } = {}) {
    let sql = 'SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (category_id) { sql += ' AND category_id = ?'; params.push(category_id); }
    if (start_date) { sql += ' AND transaction_date >= ?'; params.push(start_date); }
    if (end_date)   { sql += ' AND transaction_date <= ?'; params.push(end_date); }

    const [[{ total }]] = await pool.query(sql, params);
    return total;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color,
              b.name AS brand_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN brands b ON t.brand_id = b.id
        WHERE t.id = ? AND t.user_id = ? LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ user_id, category_id, brand_id, type, amount, description, transaction_date, note }) {
    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, category_id, brand_id, type, amount, description, transaction_date, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id || null, brand_id || null, type, amount, description, transaction_date, note || null]
    );
    return result.insertId;
  },

  async update(id, userId, { category_id, brand_id, type, amount, description, transaction_date, note }) {
    const [result] = await pool.query(
      `UPDATE transactions
          SET category_id      = COALESCE(?, category_id),
              brand_id         = COALESCE(?, brand_id),
              type             = COALESCE(?, type),
              amount           = COALESCE(?, amount),
              description      = COALESCE(?, description),
              transaction_date = COALESCE(?, transaction_date),
              note             = COALESCE(?, note)
        WHERE id = ? AND user_id = ?`,
      [category_id, brand_id, type, amount, description, transaction_date, note, id, userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },

  /* --- Analytics queries --- */

  async monthlySummary(userId, year, month) {
    const [rows] = await pool.query(
      `SELECT
          type,
          SUM(amount) AS total,
          COUNT(*)    AS count
         FROM transactions
        WHERE user_id = ?
          AND YEAR(transaction_date)  = ?
          AND MONTH(transaction_date) = ?
        GROUP BY type`,
      [userId, year, month]
    );
    return rows;
  },

  async categorySpendingByMonth(userId, year, month) {
    const [rows] = await pool.query(
      `SELECT
          c.id              AS category_id,
          c.name            AS category_name,
          c.color           AS category_color,
          c.monthly_budget,
          SUM(t.amount)     AS total_spent
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
          AND t.type    = 'expense'
          AND YEAR(t.transaction_date)  = ?
          AND MONTH(t.transaction_date) = ?
        GROUP BY c.id, c.name, c.color, c.monthly_budget
        ORDER BY total_spent DESC`,
      [userId, year, month]
    );
    return rows;
  },

  async monthlyTrend(userId, months = 6) {
    const [rows] = await pool.query(
      `SELECT
          DATE_FORMAT(transaction_date, '%Y-%m') AS month,
          type,
          SUM(amount) AS total
         FROM transactions
        WHERE user_id = ?
          AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        GROUP BY month, type
        ORDER BY month ASC`,
      [userId, months]
    );
    return rows;
  },
};

module.exports = Transaction;
