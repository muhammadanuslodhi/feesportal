const Fee = require('../models/Fee');

function recompute(doc) {
  let total = 0, pending = 0;
  for (const m of Fee.MONTHS) {
    const f = doc[m] || { paid: false, amount: 0 };
    if (f.paid) total += Number(f.amount || 0);
    else pending += Number(f.amount || 0);
  }
  doc.totalAmount = total;
  doc.pendingAmount = pending;
}

exports.list = async (req, res) => {
  const { memberId, year } = req.query;
  const filter = {};
  if (memberId) filter.memberId = memberId;
  if (year) filter.year = Number(year);
  const rows = await FeeRecord.find(filter);
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { memberId, year } = req.body;
  let doc = await FeeRecord.findOne({ memberId, year });
  if (!doc) doc = new FeeRecord({ memberId, year });
  for (const m of FeeRecord.MONTHS) {
    if (req.body[m]) doc[m] = { paid: !!req.body[m].paid, amount: Number(req.body[m].amount || 0) };
  }
  recompute(doc);
  await doc.save();
  res.json(doc);
};

exports.update = async (req, res) => {
  const doc = await FeeRecord.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  for (const m of FeeRecord.MONTHS) {
    if (req.body[m]) doc[m] = { paid: !!req.body[m].paid, amount: Number(req.body[m].amount || 0) };
  }
  recompute(doc);
  await doc.save();
  res.json(doc);
};
