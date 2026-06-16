require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Area = require('../models/Area');
const Student = require('../models/Student');
const Fee = require('../models/Fee');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([User.deleteMany(), Area.deleteMany(), Student.deleteMany(), Fee.deleteMany()]);

  await User.create({ username: 'admin', password: 'admin123' });

  const area1 = await Area.create({ areaName: 'Green Valley', chairmanName: 'Mr. John Smith', chairmanSignature: '' });
  const area2 = await Area.create({ areaName: 'Sunrise Heights', chairmanName: 'Mr. David Lee', chairmanSignature: '' });

  const students = await Student.create([
    { memberName: 'Ali Khan', fatherName: 'Ahmed Khan', areaId: area1._id },
    { memberName: 'Sara Ahmed', fatherName: 'Imran Ahmed', areaId: area1._id },
    { memberName: 'Bilal Raza', fatherName: 'Zafar Raza', areaId: area2._id },
  ]);

  const year = new Date().getFullYear();
  const MONTHS = Fee.MONTHS;
  for (const m of students) {
    const doc = { memberId: m._id, year };
    let total = 0, pending = 0;
    MONTHS.forEach((mn, i) => {
      const paid = i % 2 === 0;
      const amount = 500;
      doc[mn] = { paid, amount };
      if (paid) total += amount; else pending += amount;
    });
    doc.totalAmount = total; doc.pendingAmount = pending;
    await Fee.create(doc);
  }

  console.log('Seed complete. Admin -> admin / admin123');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
