# TaskFlow

A task management app I built as part of a full-stack assessment. It covers user auth, task CRUD, search and filtering, AES payload encryption, and is deployed on Render + Vercel.

---

## Stack

- **Backend** — Node.js + Express
- **Frontend** — Next.js 14 (App Router)
- **Database** — MongoDB with Mongoose
- **Auth** — JWT in HTTP-only cookies
- **Deployment** — Render (API) + Vercel (frontend)

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── app/
    │   ├── auth/
    │   ├── dashboard/
    │   └── tasks/
    ├── hooks/
    ├── lib/
    └── types/
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier is fine)

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
AES_SECRET_KEY=exactly_32_characters_long_key!!
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in your `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AES_SECRET_KEY=exactly_32_characters_long_key!!
```

```bash
npm run dev
```

App runs at `http://localhost:3000`.

> The `AES_SECRET_KEY` in both `.env` files must be the same string.

---

## Deployment

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Connect this repo and set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add the same environment variables from `.env`, but set `NODE_ENV=production` and `FRONTEND_URL` to your Vercel URL

### Frontend → Vercel

1. Import this repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api`
   - `NEXT_PUBLIC_AES_SECRET_KEY=your_key`

Also make sure MongoDB Atlas has **Network Access → Allow from Anywhere** (`0.0.0.0/0`) enabled, otherwise Render can't reach the database.

---

## API

All routes are prefixed with `/api`.

### Auth

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Log in |
| POST | /auth/logout | Yes | Log out |
| GET | /auth/me | Yes | Get current user |

### Tasks

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | /tasks | Yes | List tasks |
| POST | /tasks | Yes | Create task |
| GET | /tasks/:id | Yes | Get single task |
| PUT | /tasks/:id | Yes | Update task |
| DELETE | /tasks/:id | Yes | Delete task |

`GET /tasks` supports query params: `page`, `limit`, `status` (`todo` / `in-progress` / `done`), `search`.

---

### Examples

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
  "user": { "encrypted": "U2FsdGVkX1..." }
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

**Get Tasks**
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

## Security

- Passwords hashed with bcrypt at cost factor 12
- JWT stored in HTTP-only cookie, never exposed to JavaScript
- `Secure` + `SameSite=Strict` flags set in production
- Auth response payloads encrypted with AES before being sent to the client
- Helmet applied on every response for secure HTTP headers
- Rate limiting on all `/api/*` routes — 100 requests per 15 minutes
- All inputs validated and sanitised with `express-validator`
- No secrets hardcoded anywhere