'use strict';
const { pool } = require('../config/db');
const Alert = {
  async findAll(userId, { is_read } = {}) {
    let sql = `
      SELECT a.*, c.name AS category_name, c.color AS category_color
        FROM alerts a
        LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.user_id = ?`;
    const params = [userId];

    if (is_read !== undefined) {
      sql += ' AND a.is_read = ?';
      params.push(is_read ? 1 : 0);
    }

    sql += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      `SELECT a.*, c.name AS category_name, c.color AS category_color
         FROM alerts a
         LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ? AND a.user_id = ? LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },
  async create({ user_id, category_id, type, message, threshold, actual_amount }) {
    const [result] = await pool.query(
      `INSERT INTO alerts (user_id, category_id, type, message, threshold, actual_amount)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, category_id || null, type, message, threshold || null, actual_amount || null]
    );
    return result.insertId;
  },

  async markRead(id, userId) {
    const [result] = await pool.query(
      'UPDATE alerts SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },

  async markAllRead(userId) {
    const [result] = await pool.query(
      'UPDATE alerts SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM alerts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },

  async existsForMonth(userId, categoryId, year, month) {
    const [rows] = await pool.query(
      `SELECT id FROM alerts
        WHERE user_id = ? AND category_id = ? AND type = 'overspending'
          AND YEAR(created_at) = ? AND MONTH(created_at) = ?
        LIMIT 1`,
      [userId, categoryId, year, month]
    );
    return rows.length > 0;
  },
};

module.exports = Alert;
