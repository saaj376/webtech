# Sample products

From `backend`, run `npm run seed:products` to insert the five products in
`products.json` into the database selected by `MONGO_URI` in `.env`.
Prices are sample INR values. The script uses the existing `config/db.js`
connection helper and closes its connection when finished.

The script is manual: backend startup never seeds products. Repeating the
command skips existing product IDs and preserves their current values.
No users are seeded.

## Verify in MongoDB Atlas

Open your cluster's data explorer (Browse Collections), select the database
named in `MONGO_URI`, then select `products`. Use this filter:

```json
{ "productId": { "$in": [1001, 1002, 1003, 1004, 1005] } }
```

You should see five matching products after seeding. In the Indexes tab,
verify `productId_1` is unique. For `users`, verify `emailId_1` is unique.

## Verify in MongoDB Compass

Connect using the same MongoDB URI privately, open the same database and
`products` collection, and use the filter above in the Documents tab.
Check the Indexes tab for each collection's unique index.

You may alternatively import `products.json` into `products` using Compass's
Add Data / Import JSON or CSV File action. Do this only once; a second import
will produce duplicate-key errors. The seed script is preferred for repeat runs.

## Validation and passwords

Both models use Mongoose's default connection and explicit `users` / `products`
collection names. Server startup waits for both models' indexes to initialize.
Uniqueness is enforced by MongoDB indexes, not Mongoose document validation;
duplicate values fail with error code 11000.

The User model accepts bcrypt-formatted password hashes only and excludes
passwords from queries by default. It does not hash passwords. Registration
must hash passwords with bcryptjs in the next step before saving a User.
No registration or login API is implemented here.

Mongoose validators apply to model operations, not direct Compass/Atlas
inserts. MongoDB unique indexes still apply to direct inserts. Future update
APIs should enable `runValidators: true` for Mongoose update operations.
