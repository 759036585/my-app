const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少 3 位'],
      maxlength: [20, '用户名最多 20 位'],
      match: [/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线或中文'],
    },
    email: {
      type: String,
      required: [true, '邮箱不能为空'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '邮箱格式不正确'],
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少 6 位'],
    },
  },
  {
    timestamps: true,  // 自动添加 createdAt / updatedAt
  }
);

// 返回给前端时隐藏密码字段
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    created_at: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
