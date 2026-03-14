# TaskFlow — Task Management Application

A full-stack task management app built with Node.js, Next.js, and MongoDB. Users can register, log in, and manage their own tasks with full CRUD support, search, filtering, and pagination.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js + Express                 |
| Frontend   | Next.js 14 (App Router)           |
| Database   | MongoDB (Mongoose ODM)            |
| Auth       | JWT stored in HTTP-only cookies   |
| Encryption | AES via crypto-js                 |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # Auth guard, request validation
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── utils/            # JWT helpers, AES encryption
│   └── server.js         # App entry point
└── frontend/
    ├── app/
    │   ├── auth/         # Login and register pages
    │   ├── dashboard/    # Task list with search/filter/pagination
    │   └── tasks/        # Create and edit task pages
    ├── hooks/            # Auth context
    ├── lib/              # API clients
    └── types/            # Shared TypeScript types
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier works fine)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=a_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
AES_SECRET_KEY=exactly_32_characters_long_key!!
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AES_SECRET_KEY=exactly_32_characters_long_key!!
```

Start the dev server:

```bash
npm run dev
```

The app will be at `http://localhost:3000`.

---

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env.example` in the Render dashboard
6. Set `NODE_ENV=production` and `FRONTEND_URL=https://your-vercel-app.vercel.app`

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo (or a subdirectory)
2. Import the project on [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api`
   - `NEXT_PUBLIC_AES_SECRET_KEY=your_key`
4. Deploy

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint         | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | /auth/register   | No   | Create account     |
| POST   | /auth/login      | No   | Log in             |
| POST   | /auth/logout     | Yes  | Log out            |
| GET    | /auth/me         | Yes  | Get current user   |

### Tasks

| Method | Endpoint     | Auth | Description            |
|--------|--------------|------|------------------------|
| GET    | /tasks       | Yes  | List tasks (paginated) |
| POST   | /tasks       | Yes  | Create a task          |
| GET    | /tasks/:id   | Yes  | Get single task        |
| PUT    | /tasks/:id   | Yes  | Update a task          |
| DELETE | /tasks/:id   | Yes  | Delete a task          |

#### GET /tasks — Query Parameters

| Param  | Type   | Description                          |
|--------|--------|--------------------------------------|
| page   | number | Page number (default: 1)             |
| limit  | number | Results per page (default: 10, max: 50) |
| status | string | Filter by `todo`, `in-progress`, `done` |
| search | string | Search by title (case-insensitive)   |

---

### Sample Requests & Responses

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": { "id": "664a...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

**Create Task**
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Write unit tests",
  "description": "Cover all controller functions",
  "status": "todo"
}
```
```json
{
  "success": true,
  "message": "Task created.",
  "data": {
    "_id": "664b...",
    "title": "Write unit tests",
    "description": "Cover all controller functions",
    "status": "todo",
    "user": "664a...",
    "createdAt": "2025-02-26T10:00:00.000Z",
    "updatedAt": "2025-02-26T10:00:00.000Z"
  }
}
```

**Get Tasks with Pagination**
```http
GET /api/tasks?page=1&limit=5&status=todo&search=tests
```
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title must be 3–100 characters" }
  ]
}
```

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- JWT is stored in an HTTP-only cookie — inaccessible to JavaScript
- `Secure` and `SameSite=Strict` flags are applied in production
- Helmet sets secure HTTP headers on every response
- Rate limiting is applied to all `/api/*` routes (100 req / 15 min)
- Input is validated and sanitised with `express-validator` before hitting the database
- Mongoose uses strict schemas which prevent arbitrary field injection
- Environment variables are never hardcoded — all secrets live in `.env`
