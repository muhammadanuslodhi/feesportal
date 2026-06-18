const Area = require('../models/Area');
const Student = require('../models/Student');

exports.list = async (_req, res) => {
  try {
    const areas = await Area.find().sort({ createdAt: -1 }).lean();
    const withCount = await Promise.all(areas.map(async a => ({
      ...a, totalMembers: await Student.countDocuments({ areaId: a._id })
    })));
    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const a = await Area.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { areaName, chairmanName } = req.body;

    // Handle both disk storage (local) and memory storage (Vercel)
    let chairmanSignature = '';
    if (req.file) {
      if (req.file.filename) {
        // Local disk storage
        chairmanSignature = `/uploads/${req.file.filename}`;
      } else if (req.file.buffer) {
        // Vercel memory storage - convert to base64
        const base64 = req.file.buffer.toString('base64');
        chairmanSignature = `data:${req.file.mimetype};base64,${base64}`;
      }
    }

    const area = await Area.create({ areaName, chairmanName, chairmanSignature });
    res.status(201).json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const update = { ...req.body };

    if (req.file) {
      if (req.file.filename) {
        update.chairmanSignature = `/uploads/${req.file.filename}`;
      } else if (req.file.buffer) {
        const base64 = req.file.buffer.toString('base64');
        update.chairmanSignature = `data:${req.file.mimetype};base64,${base64}`;
      }
    }

    const area = await Area.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!area) return res.status(404).json({ message: 'Not found' });
    res.json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Area.findByIdAndDelete(req.params.id);
    await Student.deleteMany({ areaId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
