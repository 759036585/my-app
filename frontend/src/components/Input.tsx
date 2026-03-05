import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  type?: string
  icon?: ReactNode
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
)

export default function Input({ label, error, type = 'text', icon, ...props }: InputProps) {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 500,
          color: 'var(--text-secondary)', letterSpacing: '0.02em'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none'
          }}>
            {icon}
          </span>
        )}
        <input
          type={inputType}
          style={{
            width: '100%',
            padding: icon ? '12px 42px' : '12px 16px',
            paddingRight: isPassword ? 44 : (icon ? 42 : 16),
            background: 'var(--bg-input)',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 14,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-focus)'
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(248,113,113,0.15)' : 'var(--accent-glow)'}`
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <EyeIcon open={showPwd} />
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  )
}
