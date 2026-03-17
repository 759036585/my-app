import request from './request'
import type { AuthResponse, LoginData, RegisterData } from '../types'

/** 认证API */
export const authAPI = {
  register: (data: RegisterData) => request.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => request.post<AuthResponse>('/auth/login', data),
  getMe: () => request.get<{ user: import('../types').User }>('/auth/me'),
}

/**
 * 聊天API
 * 流式请求使用封装的 fetch（浏览器 axios 不支持 ReadableStream）
 * 统一走 localStorage token 管理，与 axios 拦截器逻辑一致
 */
export const chatAPI = {
  /** 非流式对话（使用 axios） */
  sendMessage: (messages: { role: string; content: string }[], options?: { model?: string; temperature?: number }) =>
    request.post('/chat/completions', { messages, stream: false, ...options }),

  /** 流式对话（使用 fetch + SSE，统一 token 管理） */
  sendMessageStream: async (messages: { role: string; content: string }[], options?: { model?: string; temperature?: number }) => {
    const token = localStorage.getItem('token')
    console.log('[ChatAPI] token from localStorage:', token ? `${token.substring(0, 30)}...` : '空！')
    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, stream: true, ...options }),
    })

    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('登录已过期，请重新登录')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `请求失败: ${response.status}`)
    }

    return response
  },

  /** 获取可用模型列表 */
  getModels: () => request.get('/chat/models'),
}

/** 对话记录API */
export const conversationAPI = {
  /** 获取当前用户的对话列表 */
  getList: () => request.get('/conversations'),

  /** 获取指定对话的完整消息 */
  getDetail: (id: string) => request.get(`/conversations/${id}`),

  /** 创建新对话 */
  create: (data: { title?: string; messages?: { role: string; content: string }[] }) =>
    request.post('/conversations', data),

  /** 更新对话（标题、消息等） */
  update: (id: string, data: { title?: string; messages?: { role: string; content: string }[] }) =>
    request.put(`/conversations/${id}`, data),

  /** 删除对话 */
  delete: (id: string) => request.delete(`/conversations/${id}`),
}
