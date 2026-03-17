const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  _id: false, // 消息不需要单独的_id
  timestamps: true, // 自动添加 createdAt / updatedAt
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '新的对话',
      maxlength: 100,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // 自动添加 createdAt / updatedAt
  }
);

// 按用户ID和更新时间建立复合索引，加速查询
conversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
