'use strict';

const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/auth.service');
const User = require('../models/User');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await AuthService.register({ name, email, password });
  res.status(201).json({ success: true, message: 'Account created.', user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await AuthService.login({ email, password });
  res.status(200).json({ success: true, message: 'Logged in successfully.', user, token });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

module.exports = { register, login, me };
