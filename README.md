# Harborline — Hotel Management System (MERN)

A full-stack hotel management application: MongoDB, Express, React (Vite + Tailwind), Node.js.

## Features

- **Auth**: JWT login/register, role-based access (admin / manager / staff)
- **Rooms**: create/edit/delete rooms, track status (available, occupied, cleaning, maintenance), filter & search
- **Guests**: guest directory with ID/contact details, search
- **Bookings**: create reservations with live room-availability checking (no double-booking), check-in, check-out, cancel, partial/full payment tracking
- **Dashboard**: live occupancy rate, today's check-ins/check-outs, revenue collected, guest count

## Project structure

```
hotel-management-mern/
  backend/     Express API + MongoDB models
  frontend/    React (Vite) admin UI
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local install, or a free cluster at mongodb.com/cloud/atlas)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotel_management
JWT_SECRET=replace_this_with_a_long_random_secret
NODE_ENV=development
```

Seed an admin user and a few sample rooms:

```bash
npm run seed
```

This creates `admin@hotel.com` / `admin123` and 5 sample rooms. **Change this password after first login in a real deployment** — there's no forced password-reset flow yet.

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5000`, health check at `GET /api/health`.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000` (see `vite.config.js`), so no CORS setup is needed in dev.

Sign in with `admin@hotel.com` / `admin123`, or register a new staff account from the login screen.

## 3. Build for production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (Nginx, Vercel, Netlify, or Express's `express.static`), and point it at your deployed backend URL (update the axios `baseURL` in `frontend/src/api/axios.js` or add an env-based API URL if you deploy frontend/backend separately).

For the backend, deploy to any Node host (Render, Railway, Fly.io, a VPS) and point `MONGO_URI` at a production MongoDB (e.g. Atlas). Set a strong `JWT_SECRET` and `NODE_ENV=production`.

## Roles

- **admin**: full access, including deleting rooms and guests, assigning roles
- **manager**: can create/edit rooms and guests, manage bookings
- **staff**: can manage guests and bookings, cannot create/delete rooms

New self-registrations always default to `staff`. Promote someone to `manager`/`admin` by editing their user document directly in MongoDB (or build out an admin user-management screen — not included in this MVP).

## API reference (quick)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (defaults to staff role) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/rooms` | List rooms (`?status=&type=&search=`) |
| GET | `/api/rooms/available?checkIn=&checkOut=` | Rooms free for a date range |
| POST/PUT/DELETE | `/api/rooms/:id?` | Manage rooms (admin/manager) |
| GET/POST | `/api/guests` | List / create guests |
| PUT/DELETE | `/api/guests/:id` | Update / delete guest |
| GET/POST | `/api/bookings` | List / create bookings |
| PUT | `/api/bookings/:id/checkin` | Check a guest in |
| PUT | `/api/bookings/:id/checkout` | Check a guest out |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking |
| PUT | `/api/bookings/:id/payment` | Record a payment (`{ amount }`) |
| GET | `/api/dashboard/stats` | Aggregate dashboard metrics |

All routes except `/auth/*` and `/health` require an `Authorization: Bearer <token>` header.

## What's not included (natural next steps)

- Automated tests
- Email confirmations / notifications
- Invoice/PDF generation
- Multi-hotel / multi-property support
- Admin screen for promoting user roles (currently a manual DB edit)
- Image uploads for room photos

## Tech notes

- Passwords hashed with bcrypt; JWTs expire after 7 days.
- Booking creation checks for date-range overlap server-side to prevent double-booking, even if two staff members submit at once (though under true race conditions a unique compound index on `room` + date range would add an extra layer of safety).
- Checking a guest out moves the room to `cleaning` rather than straight back to `available`, so housekeeping has a queue.
