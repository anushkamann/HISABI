'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');

const getAll = asyncHandler(async (req, res) => {
  const { limit = 50, page = 1 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [logs, total] = await Promise.all([
    ActivityLog.findAll(req.user.id, { limit, offset }),
    ActivityLog.count(req.user.id),
  ]);

  res.json({
    success: true,
    logs,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const log = await ActivityLog.findById(req.params.id, req.user.id);
  if (!log) throw new ApiError(404, 'Activity log not found.');
  res.json({ success: true, log });
});

const create = asyncHandler(async (req, res) => {
  const { action, description } = req.body;
  const id = await ActivityLog.create({ user_id: req.user.id, action, description });
  const log = await ActivityLog.findById(id, req.user.id);
  res.status(201).json({ success: true, message: 'Activity logged.', log });
});

const remove = asyncHandler(async (req, res) => {
  const affected = await ActivityLog.delete(req.params.id, req.user.id);
  if (!affected) throw new ApiError(404, 'Activity log not found.');
  res.json({ success: true, message: 'Activity log deleted.' });
});

module.exports = { getAll, getOne, create, remove };