# What this project is

This is a small clothing store web app.

## What a normal user can do

- Create an account and log in.
- Browse clothes, search by name, and filter by category.
- Add products to a cart.
- Change quantities and remove items.
- Place an order.
- See their own orders and cancel an order that is still `placed`.
- View and edit their own profile.

## What an admin can do

- Add, edit, and delete products.
- See all users and promote or demote them.
- See all orders and move them from `placed` to `shipped` to `delivered`.
- See simple analytics: product clicks and add-to-cart counts.

## Main folders

| Folder | What it contains |
| --- | --- |
| `backend/` | Express API, MongoDB models, auth, seeds |
| `frontend/` | React pages and styles |
| `postman/` | Postman collection and environment |
| `docs/` | This documentation |

## Main pages

| Page | URL |
| --- | --- |
| Register | `http://localhost:5173/` |
| Login | `http://localhost:5173/login` |
| Dashboard | `http://localhost:5173/dashboard` |
| Products | `http://localhost:5173/products` |
| Cart | `http://localhost:5173/cart` |
| Orders | `http://localhost:5173/orders` |
| Profile | `http://localhost:5173/profile` |
| Admin | `http://localhost:5173/admin` |

The admin page only opens for an admin account.
