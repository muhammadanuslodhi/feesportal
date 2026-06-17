// backend/api/diagnose-cors.js
// This middleware logs CORS information for debugging

const diagnoseCors = (req, res, next) => {
  console.log('═══════════════════════════════════════');
  console.log('📋 CORS DIAGNOSIS REQUEST');
  console.log('═══════════════════════════════════════');
  console.log('Origin:', req.get('origin') || 'NO ORIGIN HEADER');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', {
    'content-type': req.get('content-type'),
    'authorization': req.get('authorization') ? '***PRESENT***' : 'MISSING',
  });
  console.log('Environment:');
  console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  console.log('═══════════════════════════════════════\n');
  next();
};

module.exports = diagnoseCors;
