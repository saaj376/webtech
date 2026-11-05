# Security rules

## Roles

| Role | Can read | Can change |
| --- | --- | --- |
| Guest | Register and login only | Nothing |
| User | Own profile, own cart, own orders, all products | Own profile, own cart, own orders |
| Admin | All users, all orders, all products, analytics | Products, user roles, order statuses |

## Ownership

Cart, orders, and profile use the logged-in user's email from the JWT.

The backend does not trust an email sent in a cart or order request body.

Ownership checks live in middleware:

- `ownerOrAdmin` checks profile requests.
- `orderAccess` checks order requests.

This keeps the rule in one place instead of repeating it in every handler.

## Admin rules

Admins cannot:

- Delete their own account.
- Change their own role.
- Modify another admin's profile.
- See password hashes.

## Passwords

- Passwords are hashed with bcrypt.
- The password field is excluded from normal database queries.
- Login is the only place that explicitly asks for the password hash.

## Input checks

- Login and registration check that inputs are strings.
- The backend strips MongoDB operator keys like `$ne` from request bodies.
- Product filters are built from checked values.
- Request bodies are limited to 10kb.

## Rate limits

- Login: 5 failed attempts per 15 minutes.
- Other API routes: 300 requests per 15 minutes.

## Tokens

- Tokens expire after 1 hour.
- A missing, invalid, or expired token returns `401`.
- A valid token without the required role returns `403`.

## Frontend note

The frontend hides the admin link from normal users.

This is only a convenience. The backend still checks the token and role on every protected request.
