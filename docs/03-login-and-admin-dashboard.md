# Login and the admin dashboard

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@store.com` | `admin123` |
| User | `user@store.com` | `secret1` |

These accounts are created by `npm run seed:users`.

## How to log in as admin

1. Open `http://localhost:5173/login`.
2. If you are already logged in, click **Logout** first.
3. Enter:
   - Email: `admin@store.com`
   - Password: `admin123`
4. Click **Sign In**.

After login you go to the **Dashboard**.

## How to open the admin dashboard

You can use either way:

1. Click **Admin** in the top navigation bar.
2. Or click the **Open admin panel** button on the dashboard.

The direct URL is:

```text
http://localhost:5173/admin
```

## What is inside the admin dashboard

| Tab | What it does |
| --- | --- |
| Products | Add, edit, and delete products |
| Users | See all users and change their roles |
| Orders | See all orders and update their status |
| Analytics | See product clicks and add-to-cart counts |

## If you cannot see the Admin link

The Admin link only appears for admin accounts.

- You are probably logged in as a normal user.
- Click **Logout**.
- Log in again with `admin@store.com` / `admin123`.

A normal user who opens `/admin` directly is sent back to `/dashboard`.

## Admin limits

Admins cannot:

- Delete their own account.
- Change their own role.
- Modify another admin's profile.
