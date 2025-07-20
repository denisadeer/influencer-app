const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  photoUrl: { type: String, default: '' },
  records: [{
    title: String,
    description: String,
    date: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Dashboard', dashboardSchema);