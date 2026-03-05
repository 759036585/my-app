# MyApp — React + Node.js 登录注册练习项目

> 用于练习 GitHub Actions CI/CD 自动化部署

## 📁 项目结构

```
my-app/
├── .github/workflows/deploy.yml  # CI/CD 流水线
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── pages/        # 页面：登录、注册、Dashboard
│   │   ├── components/   # 通用组件：Input、Button、AuthCard
│   │   ├── hooks/        # useAuth Context
│   │   └── utils/        # axios 封装
│   └── package.json
└── backend/                      # Node.js + Express
    ├── routes/auth.js    # 注册/登录/获取用户 API
    ├── middleware/auth.js # JWT 鉴权中间件
    ├── config/database.js # SQLite 数据库
    ├── app.js            # 入口文件
    └── package.json
```

## 🚀 本地运行

### 后端
```bash
cd backend
cp .env.example .env    # 复制环境变量
npm install
npm run dev             # 启动在 http://localhost:3001
```

### 前端
```bash
cd frontend
npm install
npm run dev             # 启动在 http://localhost:5173
```

## 🔐 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET  | /api/auth/me | 获取当前用户（需 Token）|
| GET  | /api/health | 健康检查 |

## ⚙️ GitHub Secrets 配置

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret | 说明 |
|--------|------|
| SERVER_HOST | 服务器 IP |
| SERVER_USER | SSH 用户名 |
| SERVER_SSH_KEY | SSH 私钥 |
| SERVER_PORT | SSH 端口（默认 22）|
| APP_PORT | Node 服务端口（如 3001）|
| JWT_SECRET | JWT 密钥（随机字符串）|
| FRONTEND_URL | 前端地址（如 http://your-ip）|

## 🔄 CI/CD 流程

```
git push origin main
       ↓
① 安装依赖 + 运行测试
       ↓
② 构建 React → dist/
       ↓
③ SCP 上传前端文件到 /var/www/html/
       ↓
④ SSH 拉取代码 + 重装依赖 + PM2 重启
```
