import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* 顶部导航 */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 960,
        margin: '0 auto 40px',
        padding: '14px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            boxShadow: '0 0 16px var(--accent-glow)',
          }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>MyApp</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-main)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--error)'
              e.currentTarget.style.color = 'var(--error)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            退出登录
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="animate-in" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* 欢迎横幅 */}
        <div style={{
          padding: '36px 40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            right: -40, top: -40,
            width: 200, height: 200,
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }} />
          <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>
            🎉 登录成功
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            你好，{user?.username}！
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            这是你的个人控制台。CI/CD 流水线部署练习项目已就绪。
          </p>
        </div>

        {/* 信息卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {[
            { label: '用户 ID', value: `#${user?.id}`, icon: '🔑', mono: true },
            { label: '用户名', value: user?.username, icon: '👤' },
            { label: '邮箱地址', value: user?.email, icon: '📧' },
            { label: '注册时间', value: formatDate(user?.created_at), icon: '📅' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '20px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: item.mono ? 'var(--font-mono)' : 'var(--font-main)',
                wordBreak: 'break-all',
              }}>
                {item.value || '—'}
              </div>
            </div>
          ))}
        </div>

        {/* CI/CD 提示 */}
        <div style={{
          marginTop: 24,
          padding: '20px 24px',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ fontSize: 28 }}>🚀</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>CI/CD 流水线已准备就绪</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              将代码推送到 GitHub main 分支，GitHub Actions 将自动构建并部署此应用。
              查看 <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 12 }}>.github/workflows/deploy.yml</code> 了解流水线配置。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
