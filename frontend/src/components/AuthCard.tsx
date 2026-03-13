import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="animate-in" style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '40px 36px',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 卡片顶部发光线 */}
        <div style={{
          position: 'absolute',
          top: 0, left: '20%', right: '20%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        }} />

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
<span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>小李助手</span>
        </div>

        {/* 标题 */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  )
}
