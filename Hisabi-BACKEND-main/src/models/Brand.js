'use strict';

const { pool } = require('../config/db');

const Brand = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT b.*, c.name AS category_name FROM brands b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.name ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT b.*, c.name AS category_name FROM brands b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM brands WHERE category_id = ? ORDER BY name ASC',
      [categoryId]
    );
    return rows;
  },

  async create({ name, category_id }) {
    const [result] = await pool.query(
      'INSERT INTO brands (name, category_id) VALUES (?, ?)',
      [name, category_id || null]
    );
    return result.insertId;
  },

  async update(id, { name, category_id }) {
    const [result] = await pool.query(
      'UPDATE brands SET name = COALESCE(?, name), category_id = COALESCE(?, category_id) WHERE id = ?',
      [name, category_id, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = Brand;