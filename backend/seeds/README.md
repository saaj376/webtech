# Sample data

From `backend`, run `npm run seed:products` to insert or update the sixteen clothing
products in `products.json`. Product images live in
`frontend/public/images/products`. Prices are sample INR values. The script uses the
existing `config/db.js` connection helper and closes its connection when finished.

Run `npm run seed:users` to create the demo accounts:

- `admin@store.com` / `admin123` (admin)
- `user@store.com` / `secret1` (regular user)

Both seed scripts are manual: backend startup never seeds data. Products with
the same IDs are updated, so rerunning the product seed is safe. Existing user
passwords are not reset by the user seed.

## Verify in MongoDB Atlas

Open your cluster's data explorer, select the database named in `MONGO_URI`, then
select `products`. Filter by `{ "productId": { "$in": [1001, 1002, 1003, 1004, 1005] } }`
to see the first five products. In the Indexes tab, verify `productId_1` is unique.
For `users`, verify `emailId_1` is unique.

## Validation and passwords

Both models use Mongoose's default connection and explicit `users` / `products`
collection names. Server startup waits for model indexes to initialize.
Uniqueness is enforced by MongoDB indexes, not Mongoose document validation;
duplicate values fail with error code 11000.

The User model accepts bcrypt-formatted password hashes only and excludes
passwords from queries by default. Registration hashes passwords with bcryptjs,
and the user seed script does the same.
