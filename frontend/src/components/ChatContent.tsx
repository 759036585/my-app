import type { RefObject } from 'react'
import type { User } from '../types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Suggestion {
  icon: string
  title: string
  desc: string
}

interface ChatContentProps {
  user: User | null
  messages: Message[]
  isTyping: boolean
  suggestions: Suggestion[]
  messagesEndRef: RefObject<HTMLDivElement | null>
  onSuggestionClick: (desc: string) => void
}

/** 格式化时间 */
function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatContent({
  user,
  messages,
  isTyping,
  suggestions,
  messagesEndRef,
  onSuggestionClick,
}: ChatContentProps) {
  const hasMessages = messages.length > 0

  return (
    <div className="chat-messages-container">
      {!hasMessages ? (
        /* ===== 欢迎界面 ===== */
        <div className="chat-welcome">
          <div className="welcome-logo">
            <div className="welcome-logo-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                <circle cx="12" cy="6" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h1 className="welcome-title">你好，{user?.username}！</h1>
          <p className="welcome-subtitle">我是小李助手，你的智能 AI 伙伴。有什么我可以帮你的？</p>

          <div className="suggestion-grid">
            {suggestions.map((item, i) => (
              <button
                key={i}
                className="suggestion-card"
                onClick={() => onSuggestionClick(item.desc)}
              >
                <span className="suggestion-icon">{item.icon}</span>
                <span className="suggestion-title">{item.title}</span>
                <span className="suggestion-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ===== 消息列表 ===== */
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? (
                  <div className="avatar-ai">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                      <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="avatar-user">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-name">
                    {msg.role === 'assistant' ? '小李助手' : user?.username}
                  </span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.role === 'assistant' && (
                  <div className="message-actions">
                    <button className="msg-action-btn" title="复制">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                    <button className="msg-action-btn" title="点赞">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                    </button>
                    <button className="msg-action-btn" title="踩">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI 正在输入 */}
          {isTyping && (
            <div className="message-row assistant">
              <div className="message-avatar">
                <div className="avatar-ai">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                    <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                  </svg>
                </div>
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-name">小李助手</span>
                </div>
                <div className="message-text">
                  <div className="chat-typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
