const express = require('express');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { signToken, protect } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../middleware/error');

const router = express.Router();

router.post(
  '/register',
  validate({
    name: { required: true, type: 'string', min: 2 },
    email: { required: true, email: true },
    password: { required: true, type: 'string', min: 6 },
  }),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');
    const isFirst = (await User.countDocuments()) === 0;
    const user = await User.create({ name, email, password, role: isFirst ? 'admin' : undefined });
    res.status(201).json({ token: signToken(user), user });
  })
);

router.post(
  '/login',
  validate({ email: { required: true, email: true }, password: { required: true } }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.matchPassword(req.body.password))) throw new ApiError(401, 'Invalid email or password');
    if (user.active === false) throw new ApiError(403, 'Account is disabled');
    res.json({ token: signToken(user), user });
  })
);

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
