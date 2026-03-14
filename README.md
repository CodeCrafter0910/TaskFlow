# TaskFlow

A full-stack task management app with user authentication, task CRUD, search, filtering, and pagination.

## Stack

- **Backend** — Node.js + Express
- **Frontend** — Next.js 14
- **Database** — MongoDB
- **Auth** — JWT in HTTP-only cookies

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

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:3000`.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

`GET /api/tasks` supports `page`, `limit`, `status`, and `search` query params.

## Live

- Frontend — https://taskflow.vercel.app
- Backend — https://taskflow-backend.onrender.com