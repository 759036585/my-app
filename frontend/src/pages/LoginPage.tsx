import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input    from '../components/Input'
import Button   from '../components/Button'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import type { AxiosError } from 'axios'

/* ========== SVG 图标组件 ========== */
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

/* AI 机器人图标 */
const AiBotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="8" width="18" height="12" rx="3" />
    <circle cx="9" cy="14" r="1.5" fill="currentColor" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    <path d="M12 2v4" />
    <circle cx="12" cy="2" r="1" fill="currentColor" />
    <path d="M1 14h2" />
    <path d="M21 14h2" />
  </svg>
)

/* 闪烁星星图标 */
const SparkleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
)

/* 大脑/神经网络图标 */
const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z"/>
    <path d="M10 21h4"/>
    <path d="M9 13h6"/>
    <path d="M10 9.5h4"/>
  </svg>
)

/* 安全盾牌图标 */
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
)

/* 闪电图标 */
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = '请输入邮箱'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '邮箱格式不正确'
    if (!form.password) e.password = '请输入密码'
    return e
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setApiError(axiosErr.response?.data?.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  /* AI 特性列表 */
  const features = [
    { icon: <BrainIcon />, title: '智能对话', desc: '基于先进大语言模型，理解你的每一个需求' },
    { icon: <ShieldIcon />, title: '安全可靠', desc: '企业级数据加密，对话内容全程保护' },
    { icon: <ZapIcon />, title: '极速响应', desc: '毫秒级响应速度，流畅自然的交互体验' },
  ]

  return (
    <div className="login-page">
      {/* ====== 左侧 AI 展示区 ====== */}
      <div className="login-hero ai-hero">
        {/* 神经网络背景装饰 */}
        <div className="ai-neural-bg">
          <div className="neural-node n1" />
          <div className="neural-node n2" />
          <div className="neural-node n3" />
          <div className="neural-node n4" />
          <div className="neural-node n5" />
          <div className="neural-line l1" />
          <div className="neural-line l2" />
          <div className="neural-line l3" />
        </div>

        {/* 浮动粒子 */}
        <div className="ai-particles">
          <span className="particle p1"><SparkleIcon size={8} /></span>
          <span className="particle p2"><SparkleIcon size={6} /></span>
          <span className="particle p3"><SparkleIcon size={10} /></span>
          <span className="particle p4"><SparkleIcon size={7} /></span>
          <span className="particle p5"><SparkleIcon size={5} /></span>
        </div>

        {/* AI 对话气泡演示 */}
        <div className="ai-chat-demo">
          <div className="chat-bubble user-bubble animate-chat-1">
            <span>帮我分析这段代码的性能瓶颈</span>
          </div>
          <div className="chat-bubble ai-bubble animate-chat-2">
            <div className="ai-avatar">
              <AiBotIcon />
            </div>
            <div className="ai-reply">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
              <span>
                已分析完成！发现 3 个优化点：循环嵌套复杂度 O(n²)，建议使用哈希表优化...
              </span>
            </div>
          </div>
          <div className="chat-bubble user-bubble animate-chat-3">
            <span>帮我生成优化后的代码</span>
          </div>
        </div>

        {/* 底部内容 */}
        <div className="login-hero-content">
          <div className="ai-badge">
            <SparkleIcon size={12} />
            <span>AI Powered</span>
          </div>
          <h2>你的智能编程伙伴</h2>
          <p>基于前沿 AI 技术，为开发者提供智能代码分析、自动补全、问题诊断等全方位助手服务。</p>
          {/* 特性卡片 */}
          <div className="ai-features">
            {features.map((f, i) => (
              <div className="ai-feature-item" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== 右侧登录表单区 ====== */}
      <div className="login-form-side">
        <div className="login-form-card animate-in">
          {/* Logo */}
          <div className="ai-logo-row">
            <div className="ai-logo-icon">
              <AiBotIcon />
            </div>
            <span className="ai-logo-text">小李助手</span>
          </div>

          {/* 标题 */}
          <h1 className="login-title">
            欢迎回来 <span className="wave-emoji">👋</span>
          </h1>
          <p className="login-subtitle">
            登录账户，开启你的 AI 助手之旅
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="邮箱地址"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              icon={<MailIcon />}
              autoComplete="email"
            />
            <Input
              label="密码"
              type="password"
              placeholder="输入你的密码"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              icon={<LockIcon />}
              autoComplete="current-password"
            />

            {apiError && (
              <div className="login-error">
                {apiError}
              </div>
            )}

            <div style={{ marginTop: 4 }}>
              <Button type="submit" loading={loading}>
                {!loading && (
                  <>
                    <SparkleIcon size={14} />
                    <span>登录</span>
                  </>
                )}
              </Button>
            </div>

            <div className="login-footer">
              还没有账户？{' '}
              <Link to="/register" className="login-link">
                立即注册
              </Link>
            </div>
          </form>

          {/* 底部 AI 安全提示 */}
          <div className="ai-security-note">
            <ShieldIcon />
            <span>AI 对话数据全程加密保护</span>
          </div>
        </div>
      </div>
    </div>
  )
}
