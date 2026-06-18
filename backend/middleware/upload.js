const multer = require('multer');

// On Vercel (serverless), disk storage doesn't work.
// Use memory storage instead for production.
const storage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        const path = require('path');
        const fs = require('fs');
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
    });

module.exports = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
