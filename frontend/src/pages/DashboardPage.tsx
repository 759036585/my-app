import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  lastTime: string
}

const SUGGESTIONS = [
  { icon: '💡', title: '创意写作', desc: '帮我写一段故事开头' },
  { icon: '📊', title: '数据分析', desc: '解读销售数据趋势' },
  { icon: '🧑‍💻', title: '代码助手', desc: '帮我调试一段代码' },
  { icon: '📝', title: '文档润色', desc: '优化邮件的措辞表达' },
]

// 模拟AI回复
const AI_REPLIES = [
  '你好！我是小李助手，很高兴为你服务。有什么我可以帮助你的吗？ 😊',
  '这是一个很好的问题！让我来为你详细解答...\n\n首先，我们需要理解问题的核心。根据我的分析，这里有几个关键点需要注意：\n\n1. **理解上下文** - 确保我们对问题有全面的认识\n2. **分步骤解决** - 将复杂问题拆分为可管理的小任务\n3. **验证结果** - 检查我们的解决方案是否正确\n\n希望这些信息对你有帮助！如果你还有其他问题，请随时提问。',
  '好的，让我来帮你处理这个任务。以下是我的建议方案：\n\n**方案一：** 直接优化现有流程，预计可以提升 30% 的效率。\n\n**方案二：** 重新设计架构，虽然前期投入较大，但长期来看收益更高。\n\n你更倾向于哪个方案？我可以进一步展开讨论。',
  '收到！我已经理解了你的需求。让我花几秒钟来思考最优解...\n\n✅ 分析完成！这里是我的回答：\n\n简单来说，你只需要按照以下步骤操作即可完成：\n\n```\n步骤 1: 准备环境\n步骤 2: 执行核心操作\n步骤 3: 验证结果\n```\n\n如果过程中遇到任何问题，随时告诉我！',
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [conversations] = useState<Conversation[]>([
    { id: '1', title: '新的对话', lastTime: '刚刚' },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text || isTyping) return

    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // 重置输入框高度
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // 模拟AI回复
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)],
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // 自动调整高度
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const handleSuggestionClick = (desc: string) => {
    setInputValue(desc)
    // 自动聚焦输入框
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const hasMessages = messages.length > 0

  return (
    <div className="chat-layout">
      {/* ===== 左侧边栏 ===== */}
      <aside className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                <circle cx="12" cy="6" r="1" fill="currentColor"/>
              </svg>
            </div>
            {!sidebarCollapsed && <span className="sidebar-brand-text">小李助手</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
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

        {!sidebarCollapsed && (
          <>
            <button className="new-chat-btn" onClick={() => setMessages([])}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新建对话
            </button>

            <div className="sidebar-conversations">
              <div className="conversations-label">最近对话</div>
              {conversations.map(conv => (
                <div key={conv.id} className="conversation-item active">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="conversation-title">{conv.title}</span>
                  <span className="conversation-time">{conv.lastTime}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 底部用户信息 */}
        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.username}</span>
                <span className="sidebar-user-email">{user?.email}</span>
              </div>
              <button className="sidebar-logout-btn" onClick={handleLogout} title="退出登录">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="sidebar-user-collapsed" onClick={handleLogout} title="退出登录">
              <div className="sidebar-user-avatar small">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== 主聊天区域 ===== */}
      <main className="chat-main">
        {/* 消息区域 */}
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
                {SUGGESTIONS.map((item, i) => (
                  <button
                    key={i}
                    className="suggestion-card"
                    onClick={() => handleSuggestionClick(item.desc)}
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

        {/* ===== 输入区域 ===== */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="给小李助手发消息..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className={`chat-send-btn ${inputValue.trim() ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="chat-disclaimer">小李助手可能会犯错，请核实重要信息。</p>
        </div>
      </main>
    </div>
  )
}
