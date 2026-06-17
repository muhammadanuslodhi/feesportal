const Area = require('../models/Area');
const Student = require('../models/Student');
const Fee = require('../models/Fee');

const Member = Student;
const FeeRecord = Fee;

exports.areaReport = async (req, res) => {
  const { areaId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();
  const area = await Area.findById(areaId);
  if (!area) return res.status(404).json({ message: 'Area not found' });
  const members = await Member.find({ areaId }).sort({ memberId: 1 });
  const fees = await FeeRecord.find({ year, memberId: { $in: members.map(m => m._id) } });
  const feeMap = Object.fromEntries(fees.map(f => [String(f.memberId), f]));
  const rows = members.map(m => ({ member: m, fee: feeMap[String(m._id)] || null }));
  const totalCollected = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPending = fees.reduce((s, f) => s + f.pendingAmount, 0);
  res.json({
    area, year, rows,
    summary: { totalMembers: members.length, totalCollected, totalPending },
    latestUpdate: fees.reduce((d, f) => f.updatedAt > d ? f.updatedAt : d, new Date(0)),
  });
};

exports.dashboard = async (_req, res) => {
  const [totalAreas, totalMembers, fees] = await Promise.all([
    Area.countDocuments(),
    Member.countDocuments(),
    FeeRecord.find().sort({ updatedAt: -1 }).limit(10).populate({ path: 'memberId', populate: { path: 'areaId' } }),
  ]);
  const allFees = await FeeRecord.find();
  const totalCollected = allFees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPending = allFees.reduce((s, f) => s + f.pendingAmount, 0);
  res.json({ totalAreas, totalMembers, totalCollected, totalPending, latest: fees });
};
