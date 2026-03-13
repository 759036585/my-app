import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse, LoginData, RegisterData } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动带上 Token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<{ user: import('../types').User }>('/auth/me'),
}

/**
 * 聊天API
 * 流式请求使用封装的 fetch（浏览器 axios 不支持 ReadableStream）
 * 统一走 localStorage token 管理，与 axios 拦截器逻辑一致
 */
export const chatAPI = {
  /** 非流式对话（使用 axios） */
  sendMessage: (messages: { role: string; content: string }[], options?: { model?: string; temperature?: number }) =>
    api.post('/chat/completions', { messages, stream: false, ...options }),

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
  getModels: () => api.get('/chat/models'),
}

export default api
