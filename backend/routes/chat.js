const express = require('express');
const { Readable } = require('stream');
const authMiddleware = require('../middleware/auth');
const { sendMessage, sendMessageStream } = require('../services/qianfanService');

const router = express.Router();

/**
 * POST /api/chat/completions
 * 
 * 请求体:
 *   messages: Array<{role: 'user'|'assistant', content: string}> - 对话历史
 *   stream: boolean - 是否使用流式输出 (默认 true)
 *   model: string - 模型名称 (可选)
 *   temperature: number - 温度参数 (可选)
 * 
 * 响应:
 *   stream=false: JSON { content, usage, model }
 *   stream=true:  SSE 流式输出 (text/event-stream)
 */
router.post('/completions', (req, res, next) => {
  next();
}, authMiddleware, async (req, res) => {
  const { messages, stream = true, model, temperature } = req.body;

  // 参数校验
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: '消息列表不能为空' });
  }

  // 校验消息格式
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return res.status(400).json({ message: '每条消息必须包含 role 和 content 字段' });
    }
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return res.status(400).json({ message: 'role 只能为 user、assistant 或 system' });
    }
  }

  const options = {};
  if (model) options.model = model;
  if (temperature !== undefined) options.temperature = temperature;

  try {
    if (!stream) {
      // ── 普通模式：一次性返回完整回复 ──
      const result = await sendMessage(messages, options);
      return res.json({
        content: result.content,
        usage: result.usage,
        model: result.model,
      });
    }

    // ── 流式模式：SSE 输出 ──
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
    res.flushHeaders();

    const response = await sendMessageStream(messages, options);

    // Node.js 原生 fetch 返回的 response.body 是 Web ReadableStream
    // 需要转换为 Node.js Readable Stream 才能使用 .on('data') 等方法
    let nodeStream;
    if (response.body && typeof response.body.on === 'function') {
      // 已经是 Node.js Stream
      nodeStream = response.body;
    } else if (response.body && typeof response.body.getReader === 'function') {
      // Web ReadableStream → Node.js Readable
      nodeStream = Readable.fromWeb(response.body);
    } else {
      throw new Error('千帆API返回了不支持的流格式');
    }

    // 处理千帆返回的 SSE 流
    let buffer = '';

    nodeStream.on('data', (chunk) => {
      buffer += chunk.toString();

      // SSE 数据以 \n\n 分隔
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || ''; // 最后一段可能不完整，保留

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        // 处理每一行
        for (const line of trimmed.split('\n')) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();

            // [DONE] 标记表示流结束
            if (dataStr === '[DONE]') {
              res.write('data: [DONE]\n\n');
              return;
            }

            try {
              const data = JSON.parse(dataStr);

              // 检查业务错误
              if (data.error_code) {
                res.write(`data: ${JSON.stringify({ error: data.error_msg })}\n\n`);
                res.end();
                return;
              }

              // 提取增量内容
              const delta = data.choices?.[0]?.delta?.content || '';
              const finishReason = data.choices?.[0]?.finish_reason || null;

              if (delta) {
                res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
              }

              if (finishReason === 'stop') {
                // 发送 usage 信息（如果有）
                if (data.usage) {
                  res.write(`data: ${JSON.stringify({ usage: data.usage })}\n\n`);
                }
                res.write('data: [DONE]\n\n');
              }
            } catch (parseErr) {
              console.error('解析千帆SSE数据失败:', parseErr, 'raw:', dataStr);
            }
          }
        }
      }
    });

    nodeStream.on('end', () => {
      // 处理缓冲区中剩余的数据
      if (buffer.trim()) {
        for (const line of buffer.trim().split('\n')) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              res.write('data: [DONE]\n\n');
            }
          }
        }
      }
      res.end();
    });

    nodeStream.on('error', (err) => {
      console.error('千帆SSE流读取错误:', err);
      res.write(`data: ${JSON.stringify({ error: '流式传输中断' })}\n\n`);
      res.end();
    });

    // 客户端断开连接时，中止上游请求
    req.on('close', () => {
      nodeStream.destroy();
    });

  } catch (err) {
    console.error('Chat API Error:', err.message);

    // 如果已经开始了SSE响应
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ message: err.message || 'AI 服务暂时不可用，请稍后重试' });
    }
  }
});

/**
 * GET /api/chat/models
 * 获取可用的模型列表
 */
router.get('/models', authMiddleware, (req, res) => {
  const models = [
    { id: 'ernie-4.0-8k', name: '文心一言 4.0', description: '旗舰模型，能力最强' },
    { id: 'ernie-3.5-8k', name: '文心一言 3.5', description: '均衡模型，速度更快' },
    { id: 'ernie-speed-128k', name: '文心Speed', description: '极速模型，响应最快' },
    { id: 'ernie-lite-8k', name: '文心Lite', description: '轻量模型，适合简单任务' },
  ];
  res.json({ models });
});

module.exports = router;
