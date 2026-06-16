const Area = require('../models/Area');
const Student = require('../models/Student');

exports.list = async (_req, res) => {
  const areas = await Area.find().sort({ createdAt: -1 }).lean();
  const withCount = await Promise.all(areas.map(async a => ({
    ...a, totalMembers: await Member.countDocuments({ areaId: a._id })
  })));
  res.json(withCount);
};

exports.get = async (req, res) => {
  const a = await Area.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
};

exports.create = async (req, res) => {
  const { areaName, chairmanName } = req.body;
  const chairmanSignature = req.file ? `/uploads/${req.file.filename}` : '';
  const area = await Area.create({ areaName, chairmanName, chairmanSignature });
  res.status(201).json(area);
};

exports.update = async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.chairmanSignature = `/uploads/${req.file.filename}`;
  const area = await Area.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(area);
};

exports.remove = async (req, res) => {
  await Area.findByIdAndDelete(req.params.id);
  await Member.deleteMany({ areaId: req.params.id });
  res.json({ ok: true });
};
