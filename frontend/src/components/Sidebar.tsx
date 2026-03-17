import { useState } from 'react'
import type { User } from '../types'

interface Conversation {
  id: string
  title: string
  lastTime: string
}

interface SidebarProps {
  user: User | null
  collapsed: boolean
  onToggleCollapse: () => void
  onNewChat: () => void
  onLogout: () => void
  conversations: Conversation[]
  activeConvId: string
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export default function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  onNewChat,
  onLogout,
  conversations,
  activeConvId,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  // 记录鼠标悬停的对话，用于显示删除按钮
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null)

  return (
    <aside className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
              <circle cx="12" cy="6" r="1" fill="currentColor"/>
            </svg>
          </div>
          {!collapsed && <span className="sidebar-brand-text">小李助手</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            ) : (
              <>
                <polyline points="11 17 6 12 11 7"/>
                <line x1="6" y1="12" x2="20" y2="12"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          <button className="new-chat-btn" onClick={onNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建对话
          </button>

          <div className="sidebar-conversations">
            <div className="conversations-label">最近对话</div>
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${conv.id === activeConvId ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
                onMouseEnter={() => setHoveredConvId(conv.id)}
                onMouseLeave={() => setHoveredConvId(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="conversation-title">{conv.title}</span>
                {/* 悬停时显示删除按钮，否则显示时间 */}
                {hoveredConvId === conv.id ? (
                  <button
                    className="conversation-delete-btn"
                    title="删除对话"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conv.id)
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                ) : (
                  <span className="conversation-time">{conv.lastTime}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 底部用户信息 */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.username}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
            <button className="sidebar-logout-btn" onClick={onLogout} title="退出登录">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="sidebar-user-collapsed" onClick={onLogout} title="退出登录">
            <div className="sidebar-user-avatar small">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
