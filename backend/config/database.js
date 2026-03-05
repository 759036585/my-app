const mongoose = require('mongoose');

async function initDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB 连接成功:', uri.replace(/:\/\/.*@/, '://***@'));
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err.message);
    throw err;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB 连接断开');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB 重新连接成功');
  });
}

module.exports = { initDB };
