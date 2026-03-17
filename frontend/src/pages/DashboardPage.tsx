import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import { chatAPI, conversationAPI } from '../utils/api'
import Sidebar from '../components/Sidebar'
import ChatContent from '../components/ChatContent'
import ChatInput from '../components/ChatInput'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  lastTime: string
  messages: Message[]
}

const SUGGESTIONS = [
  { icon: '💡', title: '创意写作', desc: '帮我写一段故事开头' },
  { icon: '📊', title: '数据分析', desc: '解读销售数据趋势' },
  { icon: '🧑‍💻', title: '代码助手', desc: '帮我调试一段代码' },
  { icon: '📝', title: '文档润色', desc: '优化邮件的措辞表达' },
]

/** 生成对话标题：取用户第一条消息的前20个字符 */
function generateTitle(content: string) {
  const text = content.trim().replace(/\n/g, ' ')
  return text.length > 20 ? text.slice(0, 20) + '...' : text
}

/** 格式化时间为简短文字 */
function formatLastTime(date: Date | string) {
  const target = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // 多对话状态管理
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true) // 加载历史对话中

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 用于防抖保存的定时器
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 获取当前激活的对话
  const activeConversation = conversations.find(c => c.id === activeConvId)
  const messages = activeConversation?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // 切换对话后自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeConvId])

  // ===== 登录后从后端加载对话历史 =====
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await conversationAPI.getList()
        const list = res.data.conversations || []

        if (list.length === 0) {
          // 没有历史对话，创建一个空对话（此时不保存到后端，等有消息再保存）
          const newConv: Conversation = {
            id: 'local_' + Date.now().toString(),
            title: '新的对话',
            lastTime: '刚刚',
            messages: [],
          }
          setConversations([newConv])
          setActiveConvId(newConv.id)
        } else {
          // 加载列表，不加载完整消息（延迟加载）
          const convs: Conversation[] = list.map((item: any) => ({
            id: item.id,
            title: item.title,
            lastTime: formatLastTime(item.updatedAt),
            messages: [], // 消息延迟加载
          }))
          setConversations(convs)
          setActiveConvId(convs[0].id)
        }
      } catch (err) {
        console.error('加载对话历史失败:', err)
        // 失败时也创建一个本地对话，不阻塞使用
        const newConv: Conversation = {
          id: 'local_' + Date.now().toString(),
          title: '新的对话',
          lastTime: '刚刚',
          messages: [],
        }
        setConversations([newConv])
        setActiveConvId(newConv.id)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  // ===== 切换对话时，延迟加载消息 =====
  useEffect(() => {
    if (!activeConvId || activeConvId.startsWith('local_')) return

    const conv = conversations.find(c => c.id === activeConvId)
    // 如果该对话消息为空且不是本地新对话，从后端加载
    if (conv && conv.messages.length === 0) {
      conversationAPI.getDetail(activeConvId).then(res => {
        const data = res.data
        const loadedMessages: Message[] = (data.messages || []).map((m: any, idx: number) => ({
          id: `${activeConvId}_msg_${idx}`,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
        }))
        setConversations(prev =>
          prev.map(c =>
            c.id === activeConvId
              ? { ...c, messages: loadedMessages }
              : c
          )
        )
      }).catch(err => {
        console.error('加载对话消息失败:', err)
      })
    }
  }, [activeConvId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  /** 保存对话到后端（防抖） */
  const saveConversationToBackend = useCallback((convId: string, title: string, msgs: Message[]) => {
    // 清除之前的定时器
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(async () => {
      const backendMessages = msgs.map(m => ({
        role: m.role,
        content: m.content,
      }))

      try {
        if (convId.startsWith('local_')) {
          // 本地对话第一次保存到后端
          const res = await conversationAPI.create({ title, messages: backendMessages })
          const newId = res.data.id
          // 更新本地ID为后端返回的ID
          setConversations(prev =>
            prev.map(c =>
              c.id === convId ? { ...c, id: newId } : c
            )
          )
          setActiveConvId(prev => prev === convId ? newId : prev)
        } else {
          // 更新已有对话
          await conversationAPI.update(convId, { title, messages: backendMessages })
        }
      } catch (err) {
        console.error('保存对话失败:', err)
      }
    }, 500) // 500ms 防抖
  }, [])

  /** 更新指定对话的消息列表 */
  const updateConversationMessages = useCallback((convId: string, updater: (msgs: Message[]) => Message[]) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? { ...c, messages: updater(c.messages), lastTime: formatLastTime(new Date()) }
          : c
      )
    )
  }, [])

  /** 新建对话 */
  const handleNewChat = useCallback(() => {
    // 如果当前对话就是空的，不重复创建
    if (activeConversation && activeConversation.messages.length === 0) {
      inputRef.current?.focus()
      return
    }
    // 创建本地对话，等有消息时再保存到后端
    const newConv: Conversation = {
      id: 'local_' + Date.now().toString(),
      title: '新的对话',
      lastTime: '刚刚',
      messages: [],
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(newConv.id)
    setInputValue('')
  }, [activeConversation])

  /** 切换对话 */
  const handleSelectConversation = useCallback((convId: string) => {
    if (convId === activeConvId) return
    setActiveConvId(convId)
    setInputValue('')
  }, [activeConvId])

  /** 删除对话 */
  const handleDeleteConversation = useCallback((convId: string) => {
    // 从后端删除（非本地对话）
    if (!convId.startsWith('local_')) {
      conversationAPI.delete(convId).catch(err => {
        console.error('删除对话失败:', err)
      })
    }

    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId)
      if (convId === activeConvId) {
        if (updated.length === 0) {
          const newConv: Conversation = {
            id: 'local_' + Date.now().toString(),
            title: '新的对话',
            lastTime: '刚刚',
            messages: [],
          }
          setActiveConvId(newConv.id)
          return [newConv]
        }
        setActiveConvId(updated[0].id)
      }
      return updated
    })
  }, [activeConvId])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isTyping) return

    const currentConvId = activeConvId

    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    // 如果是第一条消息，自动更新对话标题
    const isFirstMessage = messages.length === 0
    const newTitle = isFirstMessage ? generateTitle(text) : activeConversation?.title || '新的对话'

    if (isFirstMessage) {
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConvId
            ? { ...c, title: newTitle, messages: [...c.messages, userMsg], lastTime: formatLastTime(new Date()) }
            : c
        )
      )
    } else {
      updateConversationMessages(currentConvId, msgs => [...msgs, userMsg])
    }

    setInputValue('')
    setIsTyping(true)

    // 重置输入框高度
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // 调用百度千帆AI API（流式输出）
    const chatHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    // 预先创建AI消息占位
    const aiMsgId = (Date.now() + 1).toString()
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    updateConversationMessages(currentConvId, msgs => [...msgs, aiMsg])

    try {
      const response = await chatAPI.sendMessageStream(chatHistory)

      // 读取SSE流
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullAiContent = ''

      if (!reader) throw new Error('无法读取响应流')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const trimmed = part.trim()
          if (!trimmed) continue

          for (const line of trimmed.split('\n')) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim()
              if (dataStr === '[DONE]') break

              try {
                const data = JSON.parse(dataStr)
                if (data.error) {
                  throw new Error(data.error)
                }
                if (data.content) {
                  fullAiContent += data.content
                  updateConversationMessages(currentConvId, msgs =>
                    msgs.map(m =>
                      m.id === aiMsgId
                        ? { ...m, content: m.content + data.content }
                        : m
                    )
                  )
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
                  console.warn('SSE解析警告:', parseErr)
                }
              }
            }
          }
        }
      }

      // ===== AI回复完成后，保存对话到后端 =====
      const finalMessages = [...messages, userMsg, { ...aiMsg, content: fullAiContent }]
      saveConversationToBackend(currentConvId, newTitle, finalMessages)

    } catch (err) {
      console.error('AI请求失败:', err)
      const errorContent = `⚠️ 抱歉，请求出错了：${err instanceof Error ? err.message : '未知错误'}。请稍后重试。`
      updateConversationMessages(currentConvId, msgs =>
        msgs.map(m =>
          m.id === aiMsgId && !m.content
            ? { ...m, content: errorContent }
            : m
        )
      )
      // 即使出错也保存用户消息到后端
      const finalMessages = [...messages, userMsg]
      saveConversationToBackend(currentConvId, newTitle, finalMessages)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const handleSuggestionClick = (desc: string) => {
    setInputValue(desc)
    inputRef.current?.focus()
  }

  // 加载中显示
  if (isLoading) {
    return (
      <div className="chat-layout">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'var(--text-muted)' }}>
          正在加载对话记录...
        </div>
      </div>
    )
  }

  return (
    <div className="chat-layout">
      {/* ===== 左侧边栏 ===== */}
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* ===== 主聊天区域 ===== */}
      <main className="chat-main">
        <ChatContent
          user={user}
          messages={messages}
          isTyping={isTyping}
          suggestions={SUGGESTIONS}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={handleSuggestionClick}
        />

        <ChatInput
          inputValue={inputValue}
          isTyping={isTyping}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
        />
      </main>
    </div>
  )
}
