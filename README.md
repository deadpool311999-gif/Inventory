# Inventory Ordering System (Owner + Storekeeper)

Production-oriented starter app for small retail inventory ordering (tobacco, alcohol, candies, misc), built with stable technologies:

- Frontend: React 18 + Vite + Bootstrap 5
- Backend: Node.js LTS + Express 4
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (email/password)

## 1) Folder Structure

```text
.
├─ backend/
│  ├─ prisma/
│  │  └─ schema.prisma
│  ├─ src/
│  │  ├─ db/prisma.js
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  │  ├─ authRoutes.js
│  │  │  ├─ ownerRoutes.js
│  │  │  └─ storeRoutes.js
│  │  ├─ utils/jwt.js
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ public/_redirects
│  ├─ src/
│  │  ├─ api/client.js
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  │  ├─ owner/
│  │  │  └─ store/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ styles.css
│  ├─ .env.example
│  └─ package.json
└─ README.md
```

## 2) Data Model (Prisma)

Implemented in `backend/prisma/schema.prisma`:

- `Store`
- `User` (`OWNER` or `STORE`, storekeeper tied to one store)
- `Category`
- `Product`
- `StoreProductAvailability`
- `Order`
- `OrderItem`

Business constraints covered:

- Role-based ownership (owner controls catalogs and availability)
- Storekeeper linked to one store
- Order status flow (`SUBMITTED` → `VIEWED`)
- Order immutability (no update route for submitted orders)
- One order per store per week (validated in backend route)

## 3) Backend API Overview

Base URL: `http://localhost:4000/api`

### Auth

- `POST /auth/bootstrap-owner` (first setup only)
- `POST /auth/login`
- `GET /auth/me`

### Owner-only routes (`/owner/*`)

- Store CRUD: `/stores`
- Category CRUD: `/categories`
- Product CRUD: `/products`
- Store availability assignment: `/stores/:storeId/availability`
- Create storekeepers: `/users/storekeepers`
- Dashboard orders: `/orders`, `/orders/:id`

### Storekeeper-only routes (`/store/*`)

- Available products grouped by category: `GET /products`
- Submit weekly order: `POST /orders`
- Past orders: `GET /orders`

## 4) Frontend Pages Included

- `Login`
- `Store product listing` (grouped by category with quantity inputs)
- `Cart` (submit weekly order)
- `Store past orders` (read-only)
- `Owner dashboard` (all submitted orders)
- `Owner management` (categories, products, stores, availability, storekeeper creation)

All pages use Bootstrap responsive grid and simple mobile-safe layout.

## 5) Local Setup (Run on your machine)

### Prerequisites

- Node.js LTS (20.x recommended)
- PostgreSQL (14+ recommended)

### Backend

1. Go to `backend`
2. Copy `.env.example` to `.env`
3. Set real `DATABASE_URL` and `JWT_SECRET`
4. Install dependencies:
   - `npm install`
5. Generate Prisma client:
   - `npm run prisma:generate`
6. Run migrations:
   - `npm run prisma:migrate`
7. Start API:
   - `npm run dev`

### Frontend

1. Go to `frontend`
2. Copy `.env.example` to `.env`
3. Set `VITE_API_URL` (e.g. `http://localhost:4000/api`)
4. Install dependencies:
   - `npm install`
5. Start app:
   - `npm run dev`

Frontend default URL: `http://localhost:5173`

## 6) Deploy Guide (Netlify + backend host)

Netlify is ideal for frontend hosting. Backend should be deployed on a Node-friendly platform (Render, Railway, Fly.io, or VPS).

### Deploy frontend to Netlify

In Netlify:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variable:
  - `VITE_API_URL=https://your-backend-domain/api`

`frontend/public/_redirects` is included to support React Router deep links.

### Deploy backend (recommended: Render/Railway)

- Root: `backend`
- Build: `npm install && npm run prisma:generate && npm run prisma:deploy`
- Start: `npm run start`
- Set env vars:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN` (your Netlify domain)
  - `PORT` (platform-managed in many hosts)

## 7) Important Notes for Production

- Use strong random `JWT_SECRET`
- Use HTTPS only in production
- Restrict CORS to your frontend domain
- Use managed PostgreSQL backups
- Add request rate limiting and audit logging before go-live
- Use a process manager/health checks for backend uptime

## 8) Suggested Next Improvements

- Add form validation (frontend + backend)
- Add edit dialogs for stores/categories/products in owner UI
- Add pagination/filtering for large order history
- Add test suite (API integration tests + UI smoke tests)
