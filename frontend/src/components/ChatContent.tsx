import { useState, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import html2canvas from 'html2canvas'
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
  conversationTitle?: string
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
  conversationTitle,
}: ChatContentProps) {
  const hasMessages = messages.length > 0
  const [showExportMenu, setShowExportMenu] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  /** 导出为文本文件 */
  const handleExportText = useCallback(() => {
    setShowExportMenu(false)
    const title = conversationTitle || '对话记录'
    const lines: string[] = []
    lines.push(`📝 ${title}`)
    lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`)
    lines.push('─'.repeat(40))
    lines.push('')

    messages.forEach(msg => {
      const name = msg.role === 'assistant' ? '🤖 小李助手' : `👤 ${user?.username || '用户'}`
      const time = formatTime(msg.timestamp)
      lines.push(`${name}  [${time}]`)
      lines.push(msg.content)
      lines.push('')
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [messages, user, conversationTitle])

  /** 导出为PNG图片 */
  const handleExportPNG = useCallback(async () => {
    setShowExportMenu(false)
    if (!chatMessagesRef.current) return

    try {
      // 克隆节点以避免修改原始DOM
      const cloneContainer = chatMessagesRef.current.cloneNode(true) as HTMLElement
      // 移除打字指示器（如果有）
      const typingEl = cloneContainer.querySelector('.message-row.assistant:last-child .chat-typing-indicator')
      if (typingEl) {
        const typingRow = typingEl.closest('.message-row')
        typingRow?.remove()
      }
      // 移除底部的 ref div
      const refDiv = cloneContainer.querySelector('[data-export-ignore]')
      refDiv?.remove()

      // 设置克隆容器样式，确保完整渲染
      cloneContainer.style.position = 'absolute'
      cloneContainer.style.left = '-9999px'
      cloneContainer.style.top = '0'
      cloneContainer.style.width = `${chatMessagesRef.current.offsetWidth}px`
      cloneContainer.style.height = 'auto'
      cloneContainer.style.overflow = 'visible'
      cloneContainer.style.background = '#0a0a0f'
      cloneContainer.style.padding = '24px 0'
      document.body.appendChild(cloneContainer)

      const canvas = await html2canvas(cloneContainer, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      document.body.removeChild(cloneContainer)

      const link = document.createElement('a')
      const title = conversationTitle || '对话记录'
      link.download = `${title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('导出PNG失败:', err)
      alert('导出PNG失败，请重试')
    }
  }, [conversationTitle])

  // 点击外部关闭菜单
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
      setShowExportMenu(false)
    }
  }, [])

  return (
    <div className="chat-messages-container" onClick={handleContainerClick}>
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
        <>
          {/* 导出按钮 - 右上角 */}
          <div className="chat-export-bar">
            <div className="chat-export-wrapper" ref={exportMenuRef}>
              <button
                className="chat-export-btn"
                title="导出对话"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>导出</span>
              </button>

              {showExportMenu && (
                <div className="chat-export-menu">
                  <button className="chat-export-menu-item" onClick={handleExportText}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>导出为文本 (.txt)</span>
                  </button>
                  <button className="chat-export-menu-item" onClick={handleExportPNG}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>导出为图片 (.png)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
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

            <div ref={messagesEndRef} data-export-ignore />
          </div>
        </>
      )}
    </div>
  )
}
