# WearIt!

A simple clothing store app built with React, Express, and MongoDB.

## Documentation

Start here: [docs/README.md](docs/README.md)

## Quick start

```bash
# backend
cd backend
npm install
npm run seed:products
npm run seed:users
npm run dev
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

Create `backend/.env` with `MONGO_URI`, `JWT_SECRET`, and optionally `PORT` and `LOGIN_MAX_ATTEMPTS` first.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@store.com` | `admin123` |
| User | `user@store.com` | `secret1` |

## Admin dashboard

1. Log in at `http://localhost:5173/login` as the admin.
2. Click **Admin** in the navbar.
3. Or open `http://localhost:5173/admin` directly.

See [docs/03-login-and-admin-dashboard.md](docs/03-login-and-admin-dashboard.md) for details.
