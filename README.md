# TaskFlow 🚀

A modern, functional full-stack **Task Management Application** built using the **MERN** stack (MongoDB, Express.js, React.js, and Node.js) with JWT authentication, responsive UI, task filtering, and a live statistics dashboard.

---

## 🌟 Key Features

- **JWT Authentication & Security**:
  - Secure user registration and login with encrypted passwords (`bcryptjs`).
  - Stateless JSON Web Token (`JWT`) authentication with route protection middleware.
  - User-scoped data isolation (users can only access, modify, and delete their own tasks).
- **Comprehensive Task CRUD**:
  - **Create**: Add tasks with title, description, priority, and optional due dates.
  - **Read**: View task list with quick status toggling.
  - **Update**: Edit task details, status, and deadlines.
  - **Delete**: Remove tasks with safety confirmation dialog.
- **Task Statuses**:
  - `Pending` (amber badge)
  - `In Progress` (sky blue badge)
  - `Completed` (emerald green badge)
- **Live Statistics Dashboard**:
  - Real-time counters: Total Tasks, Pending, In Progress, Completed.
  - Overall completion rate percentage indicator and progress bar.
  - Interactive status cards that filter the task view when clicked.
- **Search, Filter & Sorting**:
  - Live keyword search across title and description.
  - Filter by Status (`Pending`, `In Progress`, `Completed`).
  - Filter by Priority (`Low`, `Medium`, `High`).
  - Sort by Newest First, Oldest First, Due Date, or Alphabetical.
  - Overdue warning indicator for missed deadlines.
- **Clean & Responsive UI**:
  - Built with React, Tailwind CSS, and Lucide icons.
  - Optimized for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Tailwind CSS, Axios, Lucide React |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Token (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv |
| **Database** | MongoDB |
| **Testing** | Jest, Supertest |

---

## 📁 Project Structure

```text
Task-Flow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, login, getMe
│   │   │   └── taskController.js  # CRUD and statistics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification middleware
│   │   │   └── errorMiddleware.js # Centralized error & 404 handler
│   │   ├── models/
│   │   │   ├── Task.js            # Mongoose Task schema
│   │   │   └── User.js            # Mongoose User schema & password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth routes
│   │   │   └── taskRoutes.js      # /api/tasks routes
│   │   ├── app.js                 # Express app definition (for server & tests)
│   │   └── server.js              # Express HTTP server bootstrap
│   ├── tests/
│   │   ├── auth.test.js           # Auth endpoint unit/integration tests
│   │   └── task.test.js           # Task endpoint unit/integration tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # App navigation & user profile
│   │   │   ├── ProtectedRoute.jsx # Route guard for authenticated users
│   │   │   ├── StatsCard.jsx      # Metric cards with filter trigger
│   │   │   ├── TaskCard.jsx       # Individual task item card
│   │   │   ├── TaskFilters.jsx    # Search, status pills, and sort selects
│   │   │   └── TaskModal.jsx      # Modal for Create/Edit task
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # React context managing user session
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard & task manager
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Register.jsx       # Register page
│   │   ├── App.jsx                # Route declarations
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind CSS styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── .env.example
├── package.json                   # Root workspace scripts
└── README.md
```

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** running locally (`mongodb://localhost:27017/taskflow`) or a MongoDB Atlas connection string.

---

### Step 1: Install Dependencies

From the project root:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install separately:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### Step 2: Configure Environment Variables

1. In the `backend` folder:
   Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Values in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

2. In the `frontend` folder:
   Copy `.env.example` to `.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Values in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=/api
   ```

---

### Step 3: Run the Application Locally

#### Option A: Run Both Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

#### Option B: Run Services in Separate Terminals

- **Terminal 1: Start Backend**
  ```bash
  cd backend
  npm run dev
  # Server starts on http://localhost:5000
  ```

- **Terminal 2: Start Frontend**
  ```bash
  cd frontend
  npm run dev
  # Web app opens on http://localhost:3000
  ```

---

## 🧪 Running Automated Tests

The backend test suite is configured with **Jest** and **Supertest** to test authentication, route authorization, CRUD operations, statistics aggregation, and error handling.

To execute tests from the project root:
```bash
npm test
```

Or within the `backend/` directory:
```bash
cd backend
npm test
```

---

## 📦 Building Frontend for Production

To create an optimized production build of the React application:

```bash
npm run build:frontend
```
The output will be generated in `frontend/dist/`.

---

## 📡 API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user with `name`, `email`, `password` |
| `POST` | `/api/auth/login` | Public | Authenticate user with `email`, `password` |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |

### Task Endpoints (`/api/tasks`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Private | Retrieve all tasks for the user (supports query params: `status`, `priority`, `search`, `sortBy`) |
| `GET` | `/api/tasks/stats` | Private | Retrieve count breakdown (total, pending, in progress, completed, completionRate) |
| `GET` | `/api/tasks/:id` | Private | Get single task details by ID |
| `POST` | `/api/tasks` | Private | Create task (`title`, `description`, `status`, `priority`, `dueDate`) |
| `PUT` | `/api/tasks/:id` | Private | Update task properties |
| `DELETE` | `/api/tasks/:id` | Private | Delete a task |

---

## 🔐 Error Handling & Validation

- Returns uniform JSON responses:
  ```json
  {
    "success": false,
    "message": "Description of the error"
  }
  ```
- Handles HTTP `400` (Bad Request / Validation errors), `401` (Unauthorized / Token expired), `404` (Not Found), and `500` (Internal Server Error).
- Input validation ensures email uniqueness, minimum password length (6 characters), and non-empty task titles.

---

## 🌿 Git Repository

Repository: [https://github.com/shauryaadi99/devpilot-taskflow-test](https://github.com/shauryaadi99/devpilot-taskflow-test)

