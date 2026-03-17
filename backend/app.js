const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');
const { initDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
// ── 中间件 ──────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// 限流：每个 IP 每 15 分钟最多 100 次请求
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: '请求过于频繁，请稍后再试' },
});
app.use('/api/', limiter);

// 聊天接口限流：更宽松（每个 IP 每 15 分钟最多 300 次）
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: '请求过于频繁，请稍后再试' },
});

// ── 路由 ──────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/conversations', conversationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 处理 ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// ── 全局错误处理 ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

// ── 启动 ──────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ 后端服务运行在 http://localhost:${PORT}`);
    console.log(`📌 环境: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('❌ 数据库初始化失败:', err);
  process.exit(1);
});
