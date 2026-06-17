require('dotenv').config();
const app = require('./api');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Fees Portal API running on http://localhost:${PORT}\n`);
  console.log('📝 API Documentation:');
  console.log(`   - Auth:     POST /api/auth/login`);
  console.log(`   - Students: GET  /api/students`);
  console.log(`   - Fees:     GET  /api/fees`);
  console.log(`   - Areas:    GET  /api/areas`);
  console.log(`   - Reports:  GET  /api/reports\n`);
});
