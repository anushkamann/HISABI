'use strict';

const { pool } = require('../config/db');

const ActivityLog = {
  async findAll(userId, { limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ user_id, action, description }) {
    const [result] = await pool.query(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user_id, action, description]
    );
    return result.insertId;
  },

  async delete(id, userId) {
    const [result] = await pool.query('DELETE FROM activity_logs WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows;
  },

  async count(userId) {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM activity_logs WHERE user_id = ?', [userId]);
    return total;
  },
};

module.exports = ActivityLog;