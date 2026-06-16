const mongoose = require('mongoose');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const monthField = { paid: { type: Boolean, default: false }, amount: { type: Number, default: 0 } };

const schemaDef = {
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  year: { type: Number, required: true },
  totalAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
};
MONTHS.forEach(m => { schemaDef[m] = monthField; });

const FeeSchema = new mongoose.Schema(schemaDef, { timestamps: true });
FeeSchema.index({ memberId: 1, year: 1 }, { unique: true });

FeeSchema.statics.MONTHS = MONTHS;

module.exports = mongoose.model('Fee', FeeSchema);
