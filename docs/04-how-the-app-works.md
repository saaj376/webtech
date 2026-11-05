# How the app works

## The short version

1. The React frontend sends requests to the Express backend.
2. The backend checks the JWT token.
3. The backend reads or writes MongoDB.
4. The frontend shows the result.

## Login

1. The user sends an email and password to `POST /api/login`.
2. The backend checks the bcrypt password hash.
3. The backend returns a JWT token and basic user details.
4. The frontend saves the token and sends it in later requests.

The token contains:

- User ID
- Email
- Role (`user` or `admin`)

## Products

1. The frontend loads products from `GET /api/products`.
2. The user can search and filter on the page.
3. Clicking a product image records a click.
4. Clicking **Add to cart** records an add-to-cart action.

## Cart

1. Every cart route uses the logged-in user's email from the JWT.
2. The frontend never sends an email for cart actions.
3. The cart stores product IDs and quantities.
4. The backend checks stock before adding or changing a quantity.

## Orders

1. Checkout reads the user's cart.
2. The backend starts a MongoDB transaction.
3. It reduces product stock.
4. It creates the order.
5. It clears the cart.
6. If any step fails, the transaction rolls back.

Cancelling a `placed` order restores the stock.

## Order statuses

```text
placed -> shipped -> delivered
   |
   +-> cancelled
```

Only an admin can mark an order as shipped or delivered.

## Admin

The admin panel uses the same API but with an admin token.

- Product create, update, and delete need an admin token.
- User role changes need an admin token.
- Order status changes need an admin token.
- Analytics can only be read by an admin.

## Data

| Collection | Stores |
| --- | --- |
| `users` | Accounts, hashed passwords, roles |
| `products` | Clothing items, stock, images, analytics counters |
| `carts` | One cart per user email |
| `orders` | Placed orders and their status |
