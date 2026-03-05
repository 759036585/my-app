import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import Input    from '../components/Input'
import Button   from '../components/Button'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
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

// 密码强度指示器
function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const levels = [
    { label: '弱', color: '#f87171' },
    { label: '一般', color: '#fb923c' },
    { label: '较强', color: '#facc15' },
    { label: '强', color: '#34d399' },
  ]
  const level = levels[Math.max(0, score - 1)]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? level.color : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: level.color, fontWeight: 600, minWidth: 24 }}>
        {level.label}
      </span>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.username) e.username = '请输入用户名'
    else if (form.username.length < 3) e.username = '用户名至少 3 位'
    if (!form.email) e.email = '请输入邮箱'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '邮箱格式不正确'
    if (!form.password) e.password = '请输入密码'
    else if (form.password.length < 6) e.password = '密码至少 6 位'
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = '密码必须同时包含字母和数字'
    if (!form.confirm) e.confirm = '请确认密码'
    else if (form.password !== form.confirm) e.confirm = '两次密码输入不一致'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.register({
        username: form.username,
        email: form.email,
        password: form.password,
      })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <AuthCard
      title="创建账户"
      subtitle="只需几步，开始使用 MyApp"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="用户名"
          type="text"
          placeholder="至少 3 个字符"
          value={form.username}
          onChange={set('username')}
          error={errors.username}
          icon={<UserIcon />}
          autoComplete="username"
        />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Input
            label="密码"
            type="password"
            placeholder="至少 6 位，含字母和数字"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            icon={<LockIcon />}
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
        </div>
        <Input
          label="确认密码"
          type="password"
          placeholder="再次输入密码"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
          icon={<LockIcon />}
          autoComplete="new-password"
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
            {!loading && '创建账户'}
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
          已有账户？{' '}
          <Link
            to="/login"
            style={{ color: 'var(--accent)', fontWeight: 600 }}
          >
            立即登录
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
