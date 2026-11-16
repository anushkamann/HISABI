'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const categories = await Category.findAll(req.user.id);
  res.json({ success: true, categories, data: { categories } });
});

const getOne = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id, req.user.id);
  if (!cat) throw new ApiError(404, 'Category not found.');
  res.json({ success: true, data: { category: cat } });
});

const create = asyncHandler(async (req, res) => {
  const { name, type, color, monthly_budget } = req.body;
  const id = await Category.create({ name, type, color, monthly_budget, user_id: req.user.id });
  const category = await Category.findById(id, req.user.id);
  res.status(201).json({ success: true, message: 'Category created.', data: { category } });
});

const update = asyncHandler(async (req, res) => {
  const affected = await Category.update(req.params.id, req.user.id, req.body);
  if (!affected) throw new ApiError(404, 'Category not found.');
  const category = await Category.findById(req.params.id, req.user.id);
  res.json({ success: true, message: 'Category updated.', data: { category } });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Category.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Category not found.');
  res.json({ success: true, message: 'Category deleted.' });
});

module.exports = { getAll, getOne, create, update, remove };
