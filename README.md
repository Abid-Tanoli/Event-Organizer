# Event Organizer - Full Stack

A full-stack event booking platform built with React, TypeScript, Node.js, Express, and MongoDB.

## Project Structure

```
Event-Organizer/
├── Backend/                    # Node.js + Express + MongoDB API
│   ├── api/index.ts            # Vercel serverless entry point
│   ├── src/
│   │   ├── auth/               # Authentication (register/login/JWT)
│   │   ├── user/               # User management
│   │   ├── admin/              # Admin management
│   │   ├── event/              # Events CRUD
│   │   ├── category/           # Categories CRUD
│   │   ├── organizer/          # Organizer management
│   │   ├── ticket/             # Ticket booking
│   │   ├── payment/            # Payment processing
│   │   ├── stats/              # Platform statistics
│   │   ├── config/             # DB, Cloudinary, constants
│   │   └── middlewares/        # Auth, role, validation, upload
│   ├── vercel.json             # Serverless config
│   ├── .vercelignore           # Exclude from deployment bundle
│   ├── .env.example
│   └── package.json
├── Frontend/
│   ├── user/                   # Public user app (React + Vite + TypeScript)
│   │   ├── vercel.json         # SPA rewrite rules
│   │   ├── .env.example
│   │   └── package.json
│   └── admin/                  # Admin dashboard app (React + Vite + TypeScript)
│       ├── vercel.json         # SPA rewrite rules
│       ├── .env.example
│       └── package.json
```

## Prerequisites

- Node.js >= 18
- npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier) for image uploads

## Local Development Setup

### Backend

```bash
cd Backend
npm install
cp .env.example .env   # then fill in your values
npm run dev            # starts on http://localhost:5001
```

### Frontend / User

```bash
cd Frontend/user
npm install
npm run dev            # starts on http://localhost:3000
```

### Frontend / Admin

```bash
cd Frontend/admin
npm install
npm run dev            # starts on http://localhost:3001
```

### Running All Three

Open three terminals:

| Terminal | Command |
|----------|---------|
| Backend | `cd Backend && npm run dev` |
| User frontend | `cd Frontend/user && npm run dev` |
| Admin frontend | `cd Frontend/admin && npm run dev` |

## Vercel Deployment

This project deploys as **three independent Vercel projects**, each from its own folder.

### Step 1 — Deploy Backend (API)

1. Push the repo to GitHub.
2. In [vercel.com/new](https://vercel.com/new), click **Import Git Repository** and select your repo.
3. Set **Root Directory** to `Backend`.
4. Vercel auto-detects the `vercel.json` — confirm the build settings:
   - Framework Preset: **Other**
   - Build Command: (uses vercel.json `builds` config)
   - Output Directory: (not needed — serverless function)
5. Add these **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret (64+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_SALT_ROUNDS` | `10` |
| `SERVICE_FEE_PERCENT` | `0.05` |
| `CURRENCY` | `usd` |
| `CORS_ORIGIN` | `https://your-user-app.vercel.app,https://your-admin-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

6. Deploy. Note the production URL (e.g. `https://event-organizer-backend.vercel.app`).

### Step 2 — Deploy Frontend / User

1. In Vercel, import the same repo again.
2. Set **Root Directory** to `Frontend/user`.
3. Framework Preset: **Vite**.
4. Add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

5. The `vercel.json` handles SPA rewrites automatically.
6. Deploy. Note the URL (e.g. `https://event-organizer-user.vercel.app`).

### Step 3 — Deploy Frontend / Admin

1. In Vercel, import the same repo again.
2. Set **Root Directory** to `Frontend/admin`.
3. Framework Preset: **Vite**.
4. Add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

5. Deploy. Note the URL (e.g. `https://event-organizer-admin.vercel.app`).

### Step 4 — Update Backend CORS

After both frontends are deployed, go back to the **Backend** Vercel project settings and update `CORS_ORIGIN` to include both frontend production URLs (comma-separated):

```
https://event-organizer-user.vercel.app,https://event-organizer-admin.vercel.app
```

Redeploy the backend for the change to take effect.

## Admin Login

- Go to the admin app URL (e.g. `https://event-organizer-admin.vercel.app/admin/login`)
- Or create an admin via the seed script: `cd Backend && npm run seed`
- Or call `POST /api/admins/create` with `{ name, email, password }` (requires an existing admin auth token)

## Health Check

- `GET /health` — returns `{ success: true, message: "Server is running", data: { time: "..." } }`
- No database dependency — safe for uptime monitors.

## Image Uploads

Images are uploaded to **Cloudinary** via memory buffer (multer memory storage). This works on Vercel's serverless filesystem which has no persistent disk.

- Cover images uploaded via the event create/update endpoints are stored in Cloudinary under the `event-organizer` folder.
- The Cloudinary `secure_url` is saved to the event's `coverImage` field.
- For local dev without Cloudinary, the system falls back to disk storage in `Backend/uploads/`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Events
- `GET /api/events/all` - List events (pagination, search, filter)
- `GET /api/events/featured` - Featured events
- `GET /api/events/:id` - Event by ID
- `POST /api/events/create` - Create event (organizer + admin)
- `PUT /api/events/:id` - Update event
- `PUT /api/events/status/:id` - Approve/reject (admin)
- `PUT /api/events/featured/:id` - Toggle featured (admin)
- `DELETE /api/events/:id` - Delete event (admin)
- `POST /api/events/like/:id` - Like event
- `POST /api/events/share/:id` - Share event

### Categories
- `GET /api/category` - List categories (public)
- `POST /api/category` - Create category (admin)
- `PUT /api/category/:id` - Update category (admin)
- `DELETE /api/category/:id` - Delete category (admin)

### Organizers
- `GET /api/organizers/approved` - List approved organizers
- `GET /api/organizers/all` - List all (admin)
- `POST /api/organizers/create` - Create organizer
- `PUT /api/organizers/status/:id` - Update status (admin)

### Tickets
- `POST /api/tickets/create` - Book tickets
- `GET /api/tickets/user/:userId` - User's bookings
- `GET /api/tickets/event/:eventId` - Event bookings
- `POST /api/tickets/cancel/:id` - Cancel booking

### Users (admin)
- `GET /api/user` - List all users
- `GET /api/user/me` - Current user

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/verify` - Verify payment

### Stats
- `GET /api/stats/summary` - Platform stats (public)

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5001) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (64+ chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `BCRYPT_SALT_ROUNDS` | No | Bcrypt rounds (default: 10) |
| `SERVICE_FEE_PERCENT` | No | Decimal fee (default: 0.05 = 5%) |
| `CURRENCY` | No | Payment currency (default: usd) |
| `CORS_ORIGIN` | Yes | Comma-separated allowed frontend URLs |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

### Frontend (`Frontend/user/.env` and `Frontend/admin/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5001/api` or `https://your-backend.vercel.app/api`) |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router v6, Axios, shadcn/ui
- **Backend**: Node.js, Express 4, TypeScript, Mongoose, JWT, bcryptjs, Zod, Cloudinary, Multer
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (3 independent serverless/Site projects)
