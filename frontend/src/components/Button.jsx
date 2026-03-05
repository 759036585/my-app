export default function Button({ children, loading, variant = 'primary', ...props }) {
  const styles = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      hoverBg: 'var(--accent-hover)',
      boxShadow: '0 4px 20px var(--accent-glow)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1.5px solid var(--border)',
      hoverBg: 'var(--bg-input)',
    }
  }[variant]

  return (
    <button
      disabled={loading || props.disabled}
      style={{
        width: '100%',
        padding: '13px 24px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: styles.background,
        color: styles.color,
        border: styles.border || 'none',
        boxShadow: styles.boxShadow,
        opacity: (loading || props.disabled) ? 0.6 : 1,
        cursor: (loading || props.disabled) ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
      onMouseEnter={e => {
        if (!loading && !props.disabled) {
          e.currentTarget.style.background = styles.hoverBg
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = styles.background
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 16, height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}
