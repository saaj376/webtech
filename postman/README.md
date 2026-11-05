# Postman setup

1. Start the backend from `backend` with `npm run dev`.
2. Open Postman and import:
   - `Clothing Store.postman_collection.json`
   - `Clothing Store.postman_environment.json`
3. Select the **Clothing Store Local** environment.
4. Run the folders in order:
   - `01 Health`
   - `02 Auth`
   - `03 Products`
   - `04 Cart`
   - `05 Orders`
   - `06 Profile and Admin`
   - `07 Analytics`
   - `08 Admin Products`

The login requests automatically save `userToken` and `adminToken` into collection variables. Checkout requests save `orderId` and `adminOrderId`. The admin product folder generates a temporary product ID and deletes the product at the end.

The seeded demo accounts are:

- `user@store.com` / `secret1`
- `admin@store.com` / `admin123`

The collection does not contain database credentials. The backend reads them from `backend/.env`.
