# DevNotes

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)

DevNotes is a production-grade full-stack blogging platform built for engineers to document architecture decisions, share technical insights, and manage build logs.

Designed with security-first authentication, scalable REST architecture, and performance-focused frontend optimization.

---

## 🚀 Live Demo

https://devnotes-phi.vercel.app  

---

## 🧠 Architecture

### Frontend
- React 18 + Vite SPA
- Route-level code splitting using `React.lazy`
- App shell structure (Layout, Navbar, Footer)
- Context providers (Auth, Theme)
- Dedicated service layer for API communication
- SEO metadata management via React Helmet Async

### Backend
- Express.js REST API
- MVC-style structure (routes → controllers → models)
- Middleware-based security and validation pipeline
- Standardized API response format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

### Database
- MongoDB with Mongoose ODM
- Optimized indexes for search and aggregation
- Separate User and Post schemas

### API Pattern
- RESTful design under `/api`
- Auth & resource-based routing
- Pagination and filtering support

---

## 🛠 Tech Stack

### Frontend
- React
- React Router DOM
- Axios
- React Helmet Async
- React Icons
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express
- Mongoose
- JWT
- bcryptjs
- express-validator
- cookie-parser
- cors
- helmet
- express-rate-limit

### Database
- MongoDB

### Authentication
- JWT access + refresh tokens
- HTTP-only secure cookies
- CSRF token verification

### Dev Tools
- Nodemon
- PostCSS
- Autoprefixer
- Pino / Pino HTTP logging
- Sharp

### Deployment
- Vercel (separate frontend and backend configurations)

---

## ✨ Features

### 🔐 Authentication
- Register, login, logout
- Refresh token rotation
- Persistent secure session
- Protected frontend routes

### 📝 Posts
- Create, edit, delete posts
- Like / unlike posts
- Author & admin permission enforcement
- Paginated listing
- Search and tag filtering
- Top liked posts
- Platform stats aggregation

### 🎨 Content & UX
- Markdown-style code block rendering
- Theme toggle (light/dark)
- Persistent theme preference
- SEO metadata per page (title, description, canonical, OG tags)

### 🛡 Reliability & Security
- Structured logging with request IDs
- Input validation and normalized errors
- Rate limiting on auth endpoints
- CSRF protection for state-changing operations
- Helmet security headers with CSP
- CORS allowlist with credentials
- Refresh tokens hashed in database

---

## 🔐 Authentication & Security Model

- Short-lived access tokens
- Rotating refresh tokens
- HTTP-only cookie storage (XSS mitigation)
- CSRF token header verification
- Backend `protect` middleware
- Role-based access (author/admin)
- Explicit origin allowlist
- Hashed refresh tokens (never stored plaintext)

---

## 📡 API Documentation

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/auth/refresh | Rotate refresh token |
| POST | /api/auth/logout | Logout (auth + CSRF) |
| GET | /api/posts | Paginated posts |
| GET | /api/posts/search | Search posts |
| GET | /api/posts/stats | Platform statistics |
| GET | /api/posts/top-liked | Top liked posts |
| GET | /api/posts/:id | Single post |
| POST | /api/posts | Create post |
| PUT | /api/posts/:id | Update post |
| DELETE | /api/posts/:id | Delete post |
| POST | /api/posts/:id/like | Toggle like |

---

## 🏗 Design Decisions

- Chose HTTP-only cookies over localStorage to reduce XSS attack surface.
- Implemented refresh token rotation to limit session hijacking risk.
- Structured logging added for production observability.
- Lazy loading applied to optimize initial bundle size.
- Manual Vite chunk splitting for better caching and performance.

---

## ⚙️ Installation & Setup

### 1️⃣ Clone

```bash
git clone https://github.com/KareemHossny/DevNotes
cd blog
```

### 2️⃣ Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3️⃣ Setup Environment Variables

#### Server (.env)

```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
PORT=5001
NODE_ENV=development
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### Client (.env)

```
VITE_API_URL=http://localhost:5001
VITE_SITE_URL=http://localhost:5173
```

### 4️⃣ Run Development Servers

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

### 5️⃣ Production Build

```bash
cd client
npm run build
npm run preview

cd server
npm start
```

---

## 🌍 Deployment

### Frontend
- Deployed on Vercel
- SPA routing rewrite to `index.html`

### Backend
- Vercel serverless adapter
- `/api/*` routed to Express app

Production requires:
- Backend secrets
- VITE_SITE_URL
- VITE_API_URL

---

## 📂 Project Structure

```
blog/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ context/
│  │  ├─ services/
│  │  ├─ hooks/
│  │  ├─ constants/
│  │  ├─ utils/
│  │  ├─ styles/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ public/
│  ├─ vite.config.js
│  └─ vercel.json
├─ server/
│  ├─ api/index.js
│  ├─ config/db.js
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ utils/
│  ├─ server.js
│  └─ vercel.json
└─ .git/
```

---

## 📈 Performance Optimizations

- Route-level lazy loading
- Dynamic auth bootstrap
- Manual Vite chunk splitting
- Tree-shaking enabled
- LCP image preload
- Optimized Google Fonts loading
- Structured logging

---

## 🧪 Future Improvements

- Add automated tests (unit / integration / e2e)
- OpenAPI / Swagger documentation
- Redis or edge caching
- CI pipeline (lint + tests + build)
- Advanced RBAC permission system

---

## 👨‍💻 Author

**Kareem Hossny**  
Full Stack MERN Developer  
Open to freelance & junior full stack opportunities
