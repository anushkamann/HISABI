'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Brand = require('../models/Brand');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const brands = await Brand.findAll();
  res.json({ success: true, brands });
});

const getOne = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw new ApiError(404, 'Brand not found.');
  res.json({ success: true, brand });
});

const getByCategory = asyncHandler(async (req, res) => {
  const brands = await Brand.findByCategory(req.params.categoryId);
  res.json({ success: true, brands });
});

const create = asyncHandler(async (req, res) => {
  const { name, category_id } = req.body;
  const id = await Brand.create({ name, category_id });
  const brand = await Brand.findById(id);
  res.status(201).json({ success: true, message: 'Brand created.', brand });
});

const update = asyncHandler(async (req, res) => {
  const affected = await Brand.update(req.params.id, req.body);
  if (!affected) throw new ApiError(404, 'Brand not found.');
  const brand = await Brand.findById(req.params.id);
  res.json({ success: true, message: 'Brand updated.', brand });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Brand.delete(req.params.id);
  if (!affected) throw new ApiError(404, 'Brand not found.');
  res.json({ success: true, message: 'Brand deleted.' });
});

module.exports = { getAll, getOne, getByCategory, create, update, remove };