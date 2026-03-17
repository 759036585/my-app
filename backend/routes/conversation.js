const express = require('express');
const authMiddleware = require('../middleware/auth');
const Conversation = require('../models/Conversation');

const router = express.Router();

/**
 * GET /api/conversations
 * 获取当前用户的所有对话列表（不含完整消息，只返回标题和时间）
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find(
      { userId: req.user.id },
      { title: 1, updatedAt: 1, createdAt: 1, 'messages': { $slice: -1 } } // 只取最后一条消息用于预览
    ).sort({ updatedAt: -1 }).limit(50);

    const result = conversations.map(conv => ({
      id: conv._id,
      title: conv.title,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
      lastMessage: conv.messages?.[0]?.content?.slice(0, 50) || '',
    }));

    res.json({ conversations: result });
  } catch (err) {
    console.error('获取对话列表失败:', err);
    res.status(500).json({ message: '获取对话列表失败' });
  }
});

/**
 * GET /api/conversations/:id
 * 获取指定对话的完整消息记录
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: '对话不存在' });
    }

    res.json({
      id: conversation._id,
      title: conversation.title,
      messages: conversation.messages,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    });
  } catch (err) {
    console.error('获取对话详情失败:', err);
    res.status(500).json({ message: '获取对话详情失败' });
  }
});

/**
 * POST /api/conversations
 * 创建新对话
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, messages } = req.body;

    const conversation = await Conversation.create({
      userId: req.user.id,
      title: title || '新的对话',
      messages: messages || [],
    });

    res.status(201).json({
      id: conversation._id,
      title: conversation.title,
      messages: conversation.messages,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    });
  } catch (err) {
    console.error('创建对话失败:', err);
    res.status(500).json({ message: '创建对话失败' });
  }
});

/**
 * PUT /api/conversations/:id
 * 更新对话（标题、追加消息等）
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (messages !== undefined) updateData.messages = messages;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: '对话不存在' });
    }

    res.json({
      id: conversation._id,
      title: conversation.title,
      messages: conversation.messages,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    });
  } catch (err) {
    console.error('更新对话失败:', err);
    res.status(500).json({ message: '更新对话失败' });
  }
});

/**
 * DELETE /api/conversations/:id
 * 删除对话
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: '对话不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除对话失败:', err);
    res.status(500).json({ message: '删除对话失败' });
  }
});

module.exports = router;
