# API and Postman

## API base URL

```text
http://localhost:5000/api
```

Every protected request needs this header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Main endpoints

| Method | Path | Who can use it |
| --- | --- | --- |
| `GET` | `/health` | Anyone |
| `POST` | `/users` | Anyone (register) |
| `POST` | `/login` | Anyone |
| `GET` | `/users?emailId=...` | Owner or admin |
| `PUT` | `/users?emailId=...` | Owner or admin |
| `PATCH` | `/users?emailId=...` | Owner or admin |
| `DELETE` | `/users?emailId=...` | Owner or admin |
| `GET` | `/products` | Logged-in users |
| `GET` | `/products/:productId` | Logged-in users |
| `POST` | `/products` | Admin |
| `PUT` | `/products/:productId` | Admin |
| `PATCH` | `/products/:productId` | Admin |
| `DELETE` | `/products/:productId` | Admin |
| `GET` | `/cart` | Logged-in user |
| `POST` | `/cart` | Logged-in user |
| `PATCH` | `/cart/:productId` | Logged-in user |
| `DELETE` | `/cart/:productId` | Logged-in user |
| `POST` | `/orders` | Logged-in user (checkout) |
| `GET` | `/orders` | User sees own orders; admin sees all |
| `PATCH` | `/orders/:id/cancel` | Owner or admin |
| `PATCH` | `/orders/:id/status` | Admin |
| `GET` | `/admin/users` | Admin |
| `PATCH` | `/admin/users/:emailId/role` | Admin |
| `POST` | `/analytics` | Logged-in user |
| `GET` | `/analytics` | Admin |

## Quick login test

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"emailId":"admin@store.com","password":"admin123"}'
```

Copy the `token` from the response.

## Postman

1. Open Postman.
2. Import:
   - `postman/Clothing Store.postman_collection.json`
   - `postman/Clothing Store.postman_environment.json`
3. Select the **Clothing Store Local** environment.
4. Run the folders in this order:
   - `01 Health`
   - `02 Auth`
   - `03 Products`
   - `04 Cart`
   - `05 Orders`
   - `06 Profile and Admin`
   - `07 Analytics`
   - `08 Admin Products`

The login requests save `userToken` and `adminToken` automatically.

Checkout requests save the order IDs used by the cancel and status requests.

See `postman/README.md` for the short version.
