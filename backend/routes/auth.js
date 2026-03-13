const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_EXPIRES_IN = '7d';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-key';
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('用户名长度为 3-20 位')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/).withMessage('用户名只能包含字母、数字、下划线或中文'),
  body('email').trim().isEmail().withMessage('邮箱格式不正确').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('密码至少 6 位')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('密码必须包含字母和数字'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: '用户名或邮箱已被注册' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = generateToken(user);

    res.status(201).json({ message: '注册成功', token, user: user.toPublic() });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) return res.status(409).json({ message: '用户名或邮箱已被注册' });
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').trim().isEmail().withMessage('邮箱格式不正确').normalizeEmail(),
  body('password').notEmpty().withMessage('密码不能为空'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: '邮箱或密码不正确' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '邮箱或密码不正确' });

    const token = generateToken(user);
    res.json({ message: '登录成功', token, user: user.toPublic() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
