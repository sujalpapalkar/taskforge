# TaskForge 🚀

A full-stack project management system built with the MERN stack. Think Mini Jira — with Kanban boards, role-based access control, real-time analytics, and a beautiful dark/light UI.

![TaskForge](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)

---

## ✨ Features

- **Authentication** — JWT-based auth + Google OAuth via Passport.js
- **Role-Based Access** — Admin, Manager, Member roles with granular permissions
- **Projects** — Create, manage, and track projects with color coding and tags
- **Kanban Board** — Drag-friendly task board with Todo / In Progress / Review / Done columns
- **Task Management** — Full CRUD with priority, assignee, due dates, tags, and comments
- **Member Management** — Add/remove project members with role assignment
- **Analytics Dashboard** — Charts for task status, priority distribution, activity trends
- **My Tasks** — Personalized task view filtered by assignee
- **Dark / Light Theme** — System-aware theme with persistent preference
- **Settings** — Profile update, password change, notification preferences

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Recharts | Analytics charts |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication tokens |
| Passport.js | Google OAuth strategy |
| bcryptjs | Password hashing |
| express-rate-limit | API rate limiting |
| Helmet | Security headers |
| cookie-parser | Cookie handling |

---

## 📁 Project Structure

```
taskforge/
├── client/                     # React frontend
│   ├── src/
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # useProjects, useTasks, useAuth
│   │   ├── layouts/            # MainLayout
│   │   ├── lib/                # utils.js (helpers, constants)
│   │   ├── pages/              # Dashboard, Projects, ProjectDetail,
│   │   │                       # Tasks, Analytics, Settings,
│   │   │                       # Login, Register
│   │   ├── services/           # api.js, authService, projectService,
│   │   │                       # taskService
│   │   └── components/
│   │       └── shared/         # Sidebar, Navbar
│   └── index.html
│
└── server/                     # Express backend
    ├── config/                 # db.js, passport.js
    ├── controllers/            # auth, project, task, analytics
    ├── middleware/             # auth, errorHandler
    ├── models/                 # User, Project, Task
    ├── routes/                 # auth, project, task, analytics
    ├── utils/                  # AppError, sendResponse
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (optional)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskforge.git
cd taskforge
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskforge
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
COOKIE_SECRET=your_cookie_secret_here
CLIENT_URL=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Start the server:
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
# App running on http://localhost:5173
```

---

## 🔐 Role Permissions

| Action | Member | Manager | Admin |
|--------|--------|---------|-------|
| View projects they're in | ✅ | ✅ | ✅ |
| View all projects | ❌ | ❌ | ✅ |
| Create projects | ✅ | ✅ | ✅ |
| Delete projects | ❌ | Own only | ✅ |
| Add/remove members | ❌ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Update own task status | ✅ | ✅ | ✅ |
| Update any task | ❌ | ✅ | ✅ |
| Delete tasks | Own only | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ |

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login with email/password
POST   /api/auth/logout         Logout
GET    /api/auth/me             Get current user
PUT    /api/auth/profile        Update profile
PUT    /api/auth/change-password Change password
GET    /api/auth/google         Google OAuth
GET    /api/auth/google/callback Google OAuth callback
```

### Projects
```
GET    /api/projects            Get all user projects
POST   /api/projects            Create project
GET    /api/projects/:id        Get project by ID
PUT    /api/projects/:id        Update project
DELETE /api/projects/:id        Delete project
POST   /api/projects/:id/members       Add member
DELETE /api/projects/:id/members/:uid  Remove member
```

### Tasks
```
GET    /api/projects/:id/tasks  Get tasks by project (grouped)
POST   /api/projects/:id/tasks  Create task
PUT    /api/tasks/:id           Update task
DELETE /api/tasks/:id           Delete task
POST   /api/tasks/:id/comments  Add comment
```

### Analytics
```
GET    /api/analytics/dashboard Get analytics data
```

---

## 🎨 UI Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password + Google OAuth |
| Register | `/register` | Create account with role selection |
| Dashboard | `/dashboard` | Overview stats + recent activity |
| Projects | `/projects` | Grid/list view of all projects |
| Project Detail | `/projects/:id` | Kanban board with task management |
| My Tasks | `/tasks` | Personal task list with filters |
| Analytics | `/analytics` | Charts and project health metrics |
| Settings | `/settings` | Profile, security, appearance |

---

## 🌍 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL=https://your-api.railway.app/api
```

### Backend → Railway
```bash
# Connect GitHub repo to Railway
# Set all environment variables from server/.env
# Railway auto-detects Node.js and runs npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_32chars+
CLIENT_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-api.railway.app/api/auth/google/callback
```

---

## 🧪 Test Accounts

For local development, create these accounts via `/register`:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Sarah Admin | sarah@taskforge.com | Admin@123 | Admin |
| Mike Manager | mike@taskforge.com | Manager@123 | Manager |
| Tom Member | tom@taskforge.com | Member@123 | Member |

---

## 📸 Screenshots

| Dashboard | Kanban Board |
|-----------|-------------|
| Analytics overview with charts | 4-column Kanban with task cards |

| Projects | Settings |
|----------|---------|
| Grid/list view with progress bars | Profile, security, theme settings |

---

## 🔧 Scripts

### Server
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start without nodemon (production)
```

### Client
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📝 License

MIT License — feel free to use this project for learning or as a base for your own apps.

---

## 🙏 Acknowledgements

- [Lucide Icons](https://lucide.dev) — Beautiful icon library
- [Recharts](https://recharts.org) — Composable chart library
- [ui-avatars.com](https://ui-avatars.com) — Auto-generated avatars
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — UI font

---

<p align="center">Built with ❤️ using the MERN stack</p>