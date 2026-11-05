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
