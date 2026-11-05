# WearIt! — Shopping application frontend

Step 8 provides a responsive React/Vite design preview with a friendly blue/lavender palette, white cards, straightforward copy and readable typography. The existing backend is
unchanged. No forms submit to an API, no products are fetched, and no token or
credentials are persisted.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite. Routes: `/` (registration), `/login`, `/products`.
`npm run build` creates the production bundle; `npm run preview` serves it.
For deployment, configure your static host to rewrite client routes to index.html.

## Preview boundaries

- Registration and login perform local validation only and explain that nothing
  has been submitted. Password toggles work; remember-me is UI only.
- Forgot password displays a preview notice. Logout returns to the login page
  without modifying authentication storage.
- Search and category filters are visual only. There is no cart or checkout.
- `src/data/previewProducts.js` contains clearly labelled visual fixtures with
  exactly the six lab schema fields. They are not MongoDB records.
- `Products` accepts `products`, `isLoading`, and `preview` props. Pass
  `products={[]}` for the empty state, `isLoading={true}` for skeletons, and
  `preview={false}` when real data is connected in a later step.
- `src/services/api.js` prepares Axios with localhost:5000 and JSON headers.
  Pages do not import or call it yet.
- Images are served locally from `public/images`; image failure renders an
  accessible fallback. Product image lookup is presentation-only and does not
  add any fields to the backend schema.

## Step 8 files

Updated: `package.json`, `package-lock.json` (Lucide React), `index.html`,
`public/favicon.svg`, `src/App.jsx`, `src/main.jsx` (formatting), `src/index.css`.

Added:

```text
public/images/
  studio.jpg, hero.jpg, mouse.jpg, headphones.jpg,
  tshirt.jpg, backpack.jpg, watch.jpg, speaker.jpg
src/
  components/
    AuthLayout.jsx, Brand.jsx, Button.jsx, Footer.jsx, FormInput.jsx,
    FormNotice.jsx, ImageWithFallback.jsx, Navbar.jsx, PageLoader.jsx,
    ProductCard.jsx
  data/previewProducts.js
  hooks/usePreviewForm.js
  pages/Register.jsx, Login.jsx, Products.jsx
  services/api.js
  styles/auth.css, store.css
  utils/formValidation.js, productImagery.js
```

This README was also updated. Existing Vite configuration and scripts were retained.
The unused starter assets and App.css remain available but are not imported.

## Visual assets

Photography is downloaded from Unsplash and used as illustrative product imagery:

- Direct source photo IDs (images.unsplash.com):
  `photo-1497215728101-856f4ea42174` (studio),
  `photo-1496181133206-80ce9b88a853` (hero),
  `photo-1605773527852-c546a8584ea3` (mouse),
  `photo-1546435770-a3e426bf472b` (headphones),
  `photo-1521572163474-6864f9cf17ab` (T-shirt),
  `photo-1553062407-98eeb64c6a62` (backpack),
  `photo-1523275335684-37898b6baf30` (watch),
  `photo-1608043152269-423dbba4e7e1` (speaker).

Icons: Lucide React. Typography uses the device's sans-serif stack without third-party font requests.

## Verification

Production build passed. Headless Chrome checked all three routes at 1440,
1024, 768, 390 and 320px widths: no horizontal overflow, images loaded, and
inputs had associated labels. Navigation, validation, password visibility,
remember-me, mobile menu, image fallback, empty/loading states and zero backend
requests were checked. This is frontend-only verification, not an end-to-end
backend integration test.

## Lighter UI revision

Modified files: `src/components/AuthLayout.jsx`, `Brand.jsx`, `Navbar.jsx`,
`Footer.jsx`; `src/pages/Register.jsx`, `Login.jsx`, `Products.jsx`;
`src/styles/auth.css`, `store.css`; `src/index.css`; `index.html`;
`public/favicon.svg`; and this README. No new dependencies or source files
were needed. Routing, shared controls, preview fixtures and the Axios instance
were retained. No backend files changed.

## Product details, reviews, and analytics

- `/products/:productId` displays any product, supports quantity selection and adding to cart, and shows the latest 50 reviews plus the overall rating.
- Customers can create or edit one review per product after an order containing it is delivered. Ratings are integers from 1 to 5; comments are optional, up to 1,000 characters.
- Admin → Analytics supports 7, 30, and 90 days, including today in Asia/Kolkata. Recharts provides the daily sales line chart and customer funnel bars; chart code loads only when the tab opens.
- Sales are non-cancelled **order value**, not collected payments. Status counts use the current status of orders created in the period. Repeat buyers have at least two non-cancelled orders within the period.
- The funnel uses nested unique-customer groups: viewed a product, also added to cart, also placed a non-cancelled order during the period. It does not attribute sessions, products, or action ordering. Historical view/cart activity is unavailable; tracking starts with the new event collection.
- View events are recorded after a product detail page loads. Cart events and the existing cart counter are recorded by the backend after a successful cart addition.
- Backend additions: `Review` and `AnalyticsEvent` models, `/api/products/:productId/reviews`, `/api/products/:productId/reviews/me`, and admin-only `/api/analytics/summary?days=30`. Restart the backend to register these routes and initialize indexes.

Verification: `npm run build`, `npm run lint`, and from `backend`, `node --test tests/shopping-features.test.cjs`. The focused backend tests use mocked database models and an isolated HTTP listener; they do not alter the database.

### Sample chart data and reviews

From `backend`, run `npm run seed:demo` to populate dated sample orders, customer activity, and reviews for the first six existing products. Run `npm run seed:products` first if the catalog is empty. Refresh Admin → Analytics or open one of those products to see the data.

The seed uses stable fixture IDs so rerunning updates its own orders/events instead of duplicating them. Sample customers use reserved `wearit-demo-…@example.invalid` email addresses. Sample orders affect the analytics totals but do not decrement inventory. Existing customer accounts and orders are preserved. Demo customer passwords are random; use your existing admin login to view analytics.
