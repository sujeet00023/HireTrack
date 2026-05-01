# HireTrack 🚀

> **Job Application Tracking System** with analytics, workflow management, JWT authentication, multi-user team collaboration, and email reminders.

Not just another CRUD app — a production-grade mini SaaS built to impress.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Authentication** | JWT login/register, bcrypt hashing, protected routes |
| 📋 **Application Tracking** | Add/edit/delete with company, role, salary range, priority, recruiter info |
| 📊 **Analytics Dashboard** | Recharts — weekly trend, funnel, salary by status, day heatmap |
| 🔔 **Email Reminders** | Nodemailer cron job — daily 9AM follow-up emails |
| 👥 **Multi-user Teams** | Create teams, invite via code, view all member applications |
| 📁 **Resume Upload** | Multer — attach PDF/DOCX resume to each application |
| 🧠 **Smart Reminders** | Flag stalled applications after N days automatically |
| 🔍 **Filter + Search** | By status, sort by date/salary/company, live search |
| 🌙 **Dark UI** | Dark-first design system with CSS variables |
| 📱 **Mobile Responsive** | Slide-out sidebar, responsive grid on all screens |

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (jsonwebtoken + bcryptjs)
- Nodemailer (email reminders)
- Multer (file uploads)
- node-cron (scheduled jobs)
- express-rate-limit, express-validator

**Frontend**
- React 18 + Vite
- React Router v6
- Axios (with JWT interceptor + 401 auto-redirect)
- Recharts (analytics charts)
- react-hot-toast (notifications)
- Tailwind CSS + custom CSS variables

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install root concurrently tool
npm install

# Install both backend + frontend dependencies
npm run install:all
```

### 2. Set up MongoDB

Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas) and get your connection string.

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
```

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/hiretrack
JWT_SECRET=your_32_char_secret_here
JWT_EXPIRE=7d

# Gmail (use App Password, not real password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=HireTrack <you@gmail.com>

CLIENT_URL=http://localhost:5173
```

### 4. Run Development Servers

```bash
# From root — starts both backend (5000) + frontend (5173)
npm run dev
```

Or run separately:

```bash
# Terminal 1 — Backend API
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

Open → **http://localhost:5173**

---

## 📁 Project Structure

```
hiretrack/
├── package.json              ← Root scripts (run both servers)
│
├── backend/
│   ├── server.js             ← Express entry point
│   ├── .env.example          ← Environment template
│   ├── config/
│   │   ├── db.js             ← MongoDB connection
│   │   ├── email.js          ← Nodemailer templates
│   │   └── cron.js           ← Daily reminder cron job
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect middleware
│   │   └── errorHandler.js   ← Global error handler
│   ├── models/
│   │   ├── User.js           ← User schema (bcrypt, toPublic)
│   │   ├── Application.js    ← Job application schema
│   │   └── Team.js           ← Team + invite code schema
│   └── routes/
│       ├── auth.js           ← /api/auth (register, login, profile)
│       ├── applications.js   ← /api/applications (CRUD + stats)
│       └── teams.js          ← /api/teams (create, join, members)
│
└── frontend/
    ├── index.html
    ├── vite.config.js        ← Proxy /api → localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── main.jsx          ← React entry + Toaster
        ├── App.jsx           ← Router + auth guard + Shell layout
        ├── index.css         ← Design system (CSS vars, dark theme)
        ├── utils/
        │   └── api.js        ← Axios instance + JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx   ← Login, register, logout, profile
        │   └── AppsContext.jsx   ← CRUD, stats, optimistic updates
        ├── components/
        │   ├── UI.jsx            ← StatusPill, Card, Modal, StatCard…
        │   ├── Sidebar.jsx       ← Navigation with badges
        │   ├── Topbar.jsx        ← Search, notifications, Add button
        │   └── AppModal.jsx      ← Add/Edit application form
        └── pages/
            ├── AuthPage.jsx      ← Login + Register + Demo
            ├── Dashboard.jsx     ← KPIs + charts + recent table
            ├── Applications.jsx  ← Full list, filter, sort, expand
            ├── Analytics.jsx     ← Deep charts (funnel, salary, trend)
            ├── Reminders.jsx     ← Follow-up alerts + interview tracker
            ├── Team.jsx          ← Create/join teams, view members
            └── Settings.jsx      ← Profile, reminders, password, export
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update name, reminder settings |
| PUT | `/api/auth/password` | Change password |

### Applications
| Method | Route | Description |
|---|---|---|
| GET | `/api/applications` | List (filter, search, sort, paginate) |
| POST | `/api/applications` | Create application |
| GET | `/api/applications/stats` | Dashboard stats + trends |
| GET | `/api/applications/:id` | Get single |
| PUT | `/api/applications/:id` | Update |
| PATCH | `/api/applications/:id/status` | Quick status change |
| POST | `/api/applications/:id/notes` | Add note |
| POST | `/api/applications/:id/resume` | Upload resume file |
| DELETE | `/api/applications/:id` | Delete |
| DELETE | `/api/applications` | Bulk delete `{ ids: [] }` |

### Teams
| Method | Route | Description |
|---|---|---|
| POST | `/api/teams` | Create team |
| GET | `/api/teams` | List my teams |
| POST | `/api/teams/join` | Join via invite code |
| GET | `/api/teams/:id` | Team details + members |
| GET | `/api/teams/:id/applications` | All member applications |
| DELETE | `/api/teams/:id/members/:userId` | Remove member |

---

## 📧 Email Setup (Gmail)

1. Enable 2FA on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an App Password for "Mail"
4. Use that 16-char password as `EMAIL_PASS` in `.env`

---

## 🚢 Deployment

**Backend → Railway / Render**
```bash
# Set all env vars in dashboard
# Start command: node server.js
```

**Frontend → Vercel / Netlify**
```bash
npm run build --prefix frontend
# Set VITE_API_URL if not using same domain
```

**MongoDB → MongoDB Atlas** (free M0 tier works great)

---

## 📄 License

MIT — use freely for portfolio, commercial projects, or as a learning reference.

---

Built with ❤️ as a full-stack mini SaaS product.
