/**
 * 百度千帆大模型 API 配置
 * 文档: https://cloud.baidu.com/doc/qianfan-api/s/3m9b5lqft
 */

const QIANFAN_CONFIG = {
  // 千帆API基础地址
  baseURL: process.env.QIANFAN_BASE_URL || 'https://qianfan.baidubce.com',

  // API端点 - Chat/Completions
  chatEndpoint: '/v2/chat/completions',

  // API Key (Bearer Token 鉴权)
  apiKey: process.env.QIANFAN_API_KEY || '',

  // 默认模型 - ernie-4.0-8k 为百度文心一言旗舰模型
  defaultModel: process.env.QIANFAN_MODEL || 'ernie-4.0-8k',

  // 默认参数
  defaults: {
    temperature: 0.8,
    top_p: 0.8,
    max_output_tokens: 2048,
  },

  // 系统提示词 - 定义AI助手的角色
  systemPrompt: '你是"小李助手"，一个友好、专业且乐于助人的AI智能助手。你擅长回答各类问题，包括创意写作、数据分析、编程帮助和文档润色等。请用简洁清晰的中文回复，适当使用emoji让对话更生动。',
};

module.exports = QIANFAN_CONFIG;
