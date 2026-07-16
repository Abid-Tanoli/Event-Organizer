# Event Organizer - Full Stack

A full-stack event booking platform built with React, TypeScript, Node.js, Express, and MongoDB.

## Project Structure

```
Event-Organizer/
├── Backend/              # Node.js + Express + MongoDB API
│   ├── api/              # Vercel serverless entry point
│   ├── src/
│   │   ├── auth/         # Authentication (register/login/JWT)
│   │   ├── user/         # User management
│   │   ├── admin/        # Admin management
│   │   ├── event/        # Events CRUD
│   │   ├── category/     # Categories CRUD
│   │   ├── organizer/    # Organizer management
│   │   ├── ticket/       # Ticket booking
│   │   ├── payment/      # Payment processing
│   │   ├── mail/         # Email notifications
│   │   ├── config/       # DB and mail config
│   │   └── middlewares/  # Auth, role, validation, upload
│   ├── .env.example
│   └── package.json
├── Frontend-User/        # Public user app (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/          # API service files (axios)
│   │   ├── pages/
│   │   │   ├── user/     # Home, Events, EventDetails, MyBookings
│   │   │   └── auth/     # Login, Register
│   │   ├── components/   # Reusable components
│   │   └── store/        # Zustand auth store
│   ├── .env.example
│   └── package.json
├── Frontend-Admin/       # Admin dashboard app (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/          # API service files (axios)
│   │   ├── pages/
│   │   │   ├── admin/    # Dashboard, Events, Users, Organizers, Categories, Bookings
│   │   │   └── auth/     # Admin Login
│   │   ├── components/   # Reusable components
│   │   └── store/        # Zustand auth store
│   ├── .env.example
│   └── package.json
```

## Prerequisites

- Node.js >= 18
- npm or pnpm
- MongoDB Atlas account (or local MongoDB)

## Backend Setup

1. Navigate to backend:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment file:
   ```
   cp .env.example .env
   ```

4. Edit `Backend/.env` and add your MongoDB connection string:
   - Go to MongoDB Atlas > Database > Connect > Drivers
   - Copy the connection string
   - Replace `<username>`, `<password>`, `<cluster>` with your values
   - Example:
     ```
     MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/eventbooking?retryWrites=true&w=majority
     ```

5. Run backend:
   ```
   npm run dev
   ```
   Server starts on http://localhost:5001

## Frontend Setup

There are two frontend apps:

### Frontend-User (Public)

1. Navigate:
   ```
   cd Frontend-User
   ```

2. Install:
   ```
   npm install
   ```

3. The `.env` already points to local backend:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

4. Run:
   ```
   npm run dev
   ```
   Opens on http://localhost:3000

### Frontend-Admin (Dashboard)

1. Navigate:
   ```
   cd Frontend-Admin
   ```

2. Install:
   ```
   npm install
   ```

3. Run:
   ```
   npm run dev
   ```
   Opens on http://localhost:3001

### Running All Three (Backend + Both Frontends)

Open three terminals:

| Terminal | Command |
|----------|---------|
| Backend | `cd Backend && npm run dev` |
| Frontend-User | `cd Frontend-User && npm run dev` |
| Frontend-Admin | `cd Frontend-Admin && npm run dev` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Events
- `GET /api/events/all` - List events (with pagination, search, filter)
- `GET /api/events/featured` - Get featured events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/create` - Create event (admin)
- `PUT /api/events/:id` - Update event
- `PUT /api/events/status/:id` - Update event status (approve/reject)
- `PUT /api/events/featured/:id` - Toggle featured
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/like/:id` - Like event
- `POST /api/events/share/:id` - Share event

### Categories
- `GET /api/category` - List categories (public)
- `POST /api/category` - Create category (admin)
- `PUT /api/category/:id` - Update category (admin)
- `DELETE /api/category/:id` - Delete category (admin)

### Organizers
- `GET /api/organizers/all` - List organizers
- `GET /api/organizers/approved` - List approved organizers
- `POST /api/organizers/create` - Create organizer
- `PUT /api/organizers/status/:id` - Update organizer status

### Tickets
- `POST /api/tickets/create` - Book tickets
- `GET /api/tickets/user/:userId` - Get user's bookings
- `GET /api/tickets/event/:eventId` - Get event bookings
- `POST /api/tickets/cancel/:id` - Cancel booking

### Users (admin)
- `GET /api/user` - List all users
- `GET /api/user/me` - Get current user

## Vercel Deployment

### Backend (Vercel)

1. Push backend to a GitHub repo
2. In Vercel, import the backend directory as a new project
3. Set Framework Preset: **Other**
4. Set Root Directory: `Backend`
5. Add environment variables in Vercel dashboard:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. Deploy

### Frontend-User (Vercel)

1. Import `Frontend-User` directory in Vercel
2. Set Framework Preset: **Vite**
3. Set Root Directory: `Frontend-User`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   ```
5. The `vercel.json` already has React Router rewrites configured
6. Deploy

### Frontend-Admin (Vercel)

1. Import `Frontend-Admin` directory in Vercel
2. Set Framework Preset: **Vite**
3. Set Root Directory: `Frontend-Admin`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   ```
5. The `vercel.json` already has React Router rewrites configured
6. Deploy

## Admin Login

- Go to `http://localhost:3001/admin/login` (or the admin app URL)
- Register an admin via: `POST /api/admins/create` with `{ name, email, password }`
- Or create an admin user via the seed script: `npm run create-admin`

## Common Issues

- **CORS errors**: Make sure `Backend/.env` has `CORS_ORIGIN` set to your frontend URL
- **MongoDB connection**: Verify your `MONGO_URI` and whitelist your IP in Atlas
- **API not loading**: Check `VITE_API_URL` in frontend `.env` matches your backend URL
- **Port conflict**: Change `PORT` in `Backend/.env` if 5001 is in use

## Environment Variables

### Backend (`Backend/.env`)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5001) |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT tokens |
| JWT_EXPIRES_IN | Token expiry (default: 7d) |
| CORS_ORIGIN | Comma-separated allowed origins |

### Frontend (`Frontend-User/.env` and `Frontend-Admin/.env`)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base URL |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, React Query, React Router v6, Axios
- **Backend**: Node.js, Express 4, TypeScript, Mongoose, JWT, bcryptjs, Zod, Nodemailer
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (both frontend and backend)
