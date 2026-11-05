# How to run it

## What you need

- Node.js and npm
- A MongoDB Atlas database
- The Atlas connection string

## 1. Create the backend environment file

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
LOGIN_MAX_ATTEMPTS=5
```

Keep this file private. It is already ignored by git.

## 2. Start the backend

```bash
cd backend
npm install
npm run seed:products
npm run seed:users
npm run dev
```

The backend runs at `http://localhost:5000`.

Check it with:

```bash
curl http://localhost:5000/api/health
```

You should see:

```json
{ "status": "ok", "mongo": true }
```

## 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## 4. Open the app

Go to `http://localhost:5173/login` and sign in.

## About the seed commands

- `npm run seed:products` inserts or updates the 16 sample products.
- `npm run seed:users` creates the two demo users.
- Running them again is safe.

## Common problems

| Problem | Fix |
| --- | --- |
| `MONGO_URI` error | Check `backend/.env` |
| MongoDB connection fails | Check the Atlas IP allowlist and database user |
| Products page is empty | Run `npm run seed:products` |
| Admin link is missing | Log in with the admin account |
| Port 5000 is busy | Stop the old backend process |
| API returns `401` | Log in again |
