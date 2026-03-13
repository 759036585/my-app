/**
 * 百度千帆大模型 API 服务
 * 支持普通请求和流式(SSE)请求
 */

const QIANFAN_CONFIG = require('../config/qianfan');

/**
 * 构建请求体
 * @param {Array} messages - 消息历史 [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} options - 额外选项
 * @returns {Object} 请求体
 */
function buildRequestBody(messages, options = {}) {
  // 在消息最前面加入系统提示词
  const fullMessages = [
    { role: 'system', content: QIANFAN_CONFIG.systemPrompt },
    ...messages,
  ];

  return {
    model: options.model || QIANFAN_CONFIG.defaultModel,
    messages: fullMessages,
    temperature: options.temperature || QIANFAN_CONFIG.defaults.temperature,
    top_p: options.top_p || QIANFAN_CONFIG.defaults.top_p,
    max_output_tokens: options.max_output_tokens || QIANFAN_CONFIG.defaults.max_output_tokens,
    stream: !!options.stream,
  };
}

/**
 * 构建请求头
 * @returns {Object} 请求头
 */
function buildHeaders() {
  if (!QIANFAN_CONFIG.apiKey) {
    throw new Error('未配置 QIANFAN_API_KEY，请在 .env 文件中设置');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${QIANFAN_CONFIG.apiKey}`,
  };
}

/**
 * 普通请求 - 一次性返回完整回复
 * @param {Array} messages - 消息历史
 * @param {Object} options - 额外选项
 * @returns {Promise<Object>} AI回复
 */
async function sendMessage(messages, options = {}) {
  const url = `${QIANFAN_CONFIG.baseURL}${QIANFAN_CONFIG.chatEndpoint}`;
  const body = buildRequestBody(messages, { ...options, stream: false });
  const headers = buildHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('千帆API请求失败:', response.status, errorData);
    throw new Error(`千帆API请求失败: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  // 检查业务错误
  if (data.error_code) {
    throw new Error(`千帆API业务错误: ${data.error_code} - ${data.error_msg}`);
  }

  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage || {},
    model: data.model || '',
  };
}

/**
 * 流式请求 - SSE方式逐步返回内容
 * @param {Array} messages - 消息历史
 * @param {Object} options - 额外选项
 * @returns {Promise<ReadableStream>} 可读流
 */
async function sendMessageStream(messages, options = {}) {
  const url = `${QIANFAN_CONFIG.baseURL}${QIANFAN_CONFIG.chatEndpoint}`;
  const body = buildRequestBody(messages, { ...options, stream: true });
  const headers = buildHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('千帆API流式请求失败:', response.status, errorData);
    throw new Error(`千帆API流式请求失败: ${response.status} - ${errorData}`);
  }

  return response;
}

module.exports = {
  sendMessage,
  sendMessageStream,
  buildRequestBody,
};
