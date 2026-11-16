'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.findAll(req.user.id);
  res.json({ success: true, subscriptions });
});

const getOne = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id, req.user.id);
  if (!sub) throw new ApiError(404, 'Subscription not found.');
  res.json({ success: true, subscription: sub });
});

const create = asyncHandler(async (req, res) => {
  const { category_id, name, amount, billing_cycle, next_billing_date, notes } = req.body;
  const id = await Subscription.create({
    user_id: req.user.id,
    category_id,
    name,
    amount,
    billing_cycle,
    next_billing_date,
    notes,
  });
  const subscription = await Subscription.findById(id, req.user.id);
  res.status(201).json({ success: true, message: 'Subscription created.', subscription });
});

const update = asyncHandler(async (req, res) => {
  const affected = await Subscription.update(req.params.id, req.user.id, req.body);
  if (!affected) throw new ApiError(404, 'Subscription not found.');
  const subscription = await Subscription.findById(req.params.id, req.user.id);
  res.json({ success: true, message: 'Subscription updated.', subscription });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await Subscription.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Subscription not found.');
  res.json({ success: true, message: 'Subscription deleted.' });
});

module.exports = { getAll, getOne, create, update, remove };
