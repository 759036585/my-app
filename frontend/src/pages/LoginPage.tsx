import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input    from '../components/Input'
import Button   from '../components/Button'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import type { AxiosError } from 'axios'
import loginBg from '../assets/login-bg.svg'

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

  return (
    <div className="login-page">
      {/* 左侧图片展示区 */}
      <div className="login-hero">
        <img src={loginBg} alt="" />
        <div className="login-hero-content">
          <h2>构建你的下一个想法</h2>
          <p>MyApp 为你提供高效、可靠的工具链，让开发更简单、部署更快捷。</p>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className="login-form-side">
        <div className="login-form-card animate-in">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>MyApp</span>
          </div>

          {/* 标题 */}
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            欢迎回来
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 28,
            lineHeight: 1.6,
          }}>
            登录你的账户，继续使用 MyApp
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{
                padding: '10px 14px',
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--error)',
                fontSize: 13,
              }}>
                {apiError}
              </div>
            )}

            <div style={{ marginTop: 4 }}>
              <Button type="submit" loading={loading}>
                {!loading && '登录'}
              </Button>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-secondary)',
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
              marginTop: 4,
            }}>
              还没有账户？{' '}
              <Link
                to="/register"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.target as HTMLElement).style.opacity = '0.8'}
                onMouseLeave={e => (e.target as HTMLElement).style.opacity = '1'}
              >
                立即注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
