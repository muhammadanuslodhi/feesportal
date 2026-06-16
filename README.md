# Fees Management Portal

Full-stack application: **React (Vite) + Tailwind CSS** frontend, **Node.js + Express + MongoDB (Mongoose)** backend, JWT auth, PDF export.

## Folder Structure

```
fees-portal/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── seed/seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

## How to Run in VS Code

### 1. Prerequisites
- Install **Node.js 18+** → https://nodejs.org
- Install **MongoDB** locally OR get a free **MongoDB Atlas** URI → https://www.mongodb.com/atlas
- Install **VS Code** + extensions: ESLint, Tailwind CSS IntelliSense

### 2. Open the project
```bash
code fees-portal
```

### 3. Backend setup
Open a terminal in VS Code (`Ctrl + ~`) and run:
```bash
cd backend
cp .env.example .env
# Edit .env -> set MONGO_URI and JWT_SECRET
npm install
npm run seed     # creates admin user + sample data
npm run dev      # starts API at http://localhost:5000
```

Default admin login:
- **Username:** `admin`
- **Password:** `admin123`

### 4. Frontend setup
Open a **second terminal** in VS Code:
```bash
cd frontend
npm install
npm run dev      # opens http://localhost:5173
```

### 5. Login
Go to http://localhost:5173 → log in with `admin / admin123`.

### 6. Build for production
```bash
cd frontend && npm run build
cd ../backend && npm start
```

---
© 2026 Fees Portal Management System
