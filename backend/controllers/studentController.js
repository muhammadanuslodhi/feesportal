const Student = require('../models/Student');

exports.list = async (req, res) => {
  const { areaId, q, memberId } = req.query;
  const filter = {};
  if (areaId) filter.areaId = areaId;
  if (memberId) filter.memberId = new RegExp(memberId, 'i');
  if (q) filter.memberName = new RegExp(q, 'i');
  const students = await Student.find(filter).populate('areaId', 'areaName').sort({ createdAt: -1 });
  res.json(students);
};

exports.get = async (req, res) => {
  const student = await Student.findById(req.params.id).populate('areaId');
  if (!student) return res.status(404).json({ message: 'Not found' });
  res.json(student);
};

exports.create = async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
};

exports.update = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
};

exports.remove = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
