const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, index: true },
  memberName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
}, { timestamps: true });

StudentSchema.pre('validate', async function (next) {
  if (this.memberId) return next();
  const count = await mongoose.model('Student').countDocuments();
  this.memberId = 'M' + String(count + 1).padStart(5, '0');
  next();
});

module.exports = mongoose.model('Student', StudentSchema);
