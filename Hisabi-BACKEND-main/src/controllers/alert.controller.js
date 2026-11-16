'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Alert = require('../models/Alert');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const { is_read } = req.query;
  const filter = is_read !== undefined ? { is_read: is_read === 'true' } : {};
  const alerts = await Alert.findAll(req.user.id, filter);
  res.json({ success: true, alerts });
});

const getOne = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id, req.user.id);
  if (!alert) throw new ApiError(404, 'Alert not found.');
  res.json({ success: true, alert });
});

const create = asyncHandler(async (req, res) => {
  const { category_id, type, message, threshold, actual_amount } = req.body;
  const id = await Alert.create({
    user_id: req.user.id,
    category_id,
    type,
    message,
    threshold,
    actual_amount,
  });
  const alert = await Alert.findById(id, req.user.id);
  res.status(201).json({ success: true, message: 'Alert created.', alert });
});

const markRead = asyncHandler(async (req, res) => {
  const affected = await Alert.markRead(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Alert not found.');
  res.json({ success: true, message: 'Alert marked as read.' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Alert.markAllRead(req.user.id);
  res.json({ success: true, message: 'All alerts marked as read.' });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Alert.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Alert not found.');
  res.json({ success: true, message: 'Alert deleted.' });
});

module.exports = { getAll, getOne, create, markRead, markAllRead, remove };
