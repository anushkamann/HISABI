'use strict';

const { pool } = require('../config/db');

const Subscription = {
  async findAll(userId) {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS category_name, c.color AS category_color
         FROM subscriptions s
         LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = ?
        ORDER BY s.next_billing_date ASC`,
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS category_name
         FROM subscriptions s
         LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = ? AND s.user_id = ? LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ user_id, category_id, name, amount, billing_cycle, next_billing_date, notes }) {
    const [result] = await pool.query(
      `INSERT INTO subscriptions
          (user_id, category_id, name, amount, billing_cycle, next_billing_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id || null, name, amount, billing_cycle, next_billing_date, notes || null]
    );
    return result.insertId;
  },

  async update(id, userId, { category_id, name, amount, billing_cycle, next_billing_date, notes, is_active }) {
    const [result] = await pool.query(
      `UPDATE subscriptions
          SET category_id       = COALESCE(?, category_id),
              name              = COALESCE(?, name),
              amount            = COALESCE(?, amount),
              billing_cycle     = COALESCE(?, billing_cycle),
              next_billing_date = COALESCE(?, next_billing_date),
              notes             = COALESCE(?, notes),
              is_active         = COALESCE(?, is_active)
        WHERE id = ? AND user_id = ?`,
      [category_id, name, amount, billing_cycle, next_billing_date, notes, is_active, id, userId]
    );
    return result.affectedRows;
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },

  async totalMonthlySpend(userId) {
    const [rows] = await pool.query(
      `SELECT
          SUM(CASE
            WHEN billing_cycle = 'weekly'  THEN amount * 4.33
            WHEN billing_cycle = 'yearly'  THEN amount / 12
            ELSE amount
          END) AS monthly_equivalent
         FROM subscriptions
        WHERE user_id = ? AND is_active = 1`,
      [userId]
    );
    return rows[0].monthly_equivalent || 0;
  },
};

module.exports = Subscription;
