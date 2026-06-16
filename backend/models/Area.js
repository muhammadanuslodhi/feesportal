const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  areaName: { type: String, required: true, trim: true },
  chairmanName: { type: String, required: true, trim: true },
  chairmanSignature: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Area', AreaSchema);
