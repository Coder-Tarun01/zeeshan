# ZEESHAN — Mutton & Chicken

A premium, fully responsive single-page website for **ZEESHAN Mutton & Chicken** — a chicken and
non-veg food outlet. Built with **React + TypeScript + Tailwind CSS + Lucide icons**, with a
functional WhatsApp ordering flow and a staff-only menu manager.

```
zeeshan/
  frontend/     Vite + React + TypeScript site (this README)
  backend/      FastAPI + PostgreSQL admin auth API (see backend/README.md)
  source-photos/  original dish photographs (not published)
```

---

## Quick start

```bash
# 1. the site
cd frontend
npm install
npm run dev      # http://localhost:5175
npm run build    # type-check + production build into frontend/dist
npm run preview  # preview the production build on http://localhost:5175

# 2. the admin API (only needed for /admin)
cd ../backend
python -m venv .venv && .venv\Scripts\activate      # Windows
pip install -r requirements.txt
copy .env.example .env                              # then edit JWT_SECRET
python -m app.cli create-admin --username owner --role owner
uvicorn app.main:app --reload --port 8000
```

Requires Node 18+ and Python 3.11+.

---

## Docker (one command for the whole stack)

Postgres + FastAPI + the built site, wired together:

```bash
cp .env.example .env      # fill in POSTGRES_PASSWORD, JWT_SECRET (+ first admin, see below)
docker compose up -d --build
```

| Service | URL / port | Notes |
| --- | --- | --- |
| **web** (nginx) | http://localhost:8080 | built SPA, SPA-fallback routing, gzip, immutable asset caching |
| **api** (uvicorn) | http://localhost:8000 · docs at `/api/docs` | FastAPI + PostgreSQL |
| **db** (PostgreSQL 16) | internal `5432` only | data in the `db-data` volume |

```bash
docker compose ps                    # service health
docker compose logs -f api           # follow the API
docker compose down                  # stop everything (keeps data)
docker compose down -v               # stop + delete the database volume
docker compose up -d --build web     # rebuild the site (needed after changing VITE_API_URL)

# create/reset an admin inside the running container
docker compose exec api python -m app.cli create-admin --username owner --role owner
docker compose exec api python -m app.cli list-admins

# inspect the database
docker compose exec db psql -U zeeshan -d zeeshan -c "select username, role, last_login_at from admin_users;"
```

**How the pieces connect**

* `DATABASE_URL` is composed from `POSTGRES_*` and points at the `db` service.
* `VITE_API_URL` is **baked into the JavaScript at build time**, so it must be a URL the *browser*
  can reach (`http://localhost:8000`, or `https://api.example.com` behind a domain). Change it →
  rebuild the `web` image.
* `CORS_ORIGINS` must contain the site's origin exactly (`http://localhost:8080`).
* The first admin is created on boot **only if the table is empty** — from
  `BOOTSTRAP_USERNAME` / `BOOTSTRAP_PASSWORD`. Clear the password from `.env` once you have signed
  in and changed it.
* `ENVIRONMENT=production` makes the API refuse to start without a `JWT_SECRET` of 32+ characters.

**Port conflicts.** If `docker compose up` says `Bind for 0.0.0.0:8000 failed: port is already
allocated`, set `API_PORT=8001` (and `VITE_API_URL=http://localhost:8001`) in `.env`, then
`docker compose up -d --build web api`.

---

## 1. Add the real business details (do this first)

Everything factual lives in **`frontend/src/data/site.ts`**. Fields left empty render a graceful,
honest fallback — nothing is invented.

| Field | What to paste | Example |
| --- | --- | --- |
| `whatsapp` | Digits only, country code first | `919876543210` |
| `phone` | Full international number for `tel:` links | `+91 98765 43210` |
| `phoneDisplay` | How the number should look on screen | `+91 98765 43210` |
| `addressLine` / `addressArea` | Shop address | `Shop 4, Main Road` / `Old City 500002` |
| `hours` | One row per timing block | `{ days: 'Mon – Sun', time: '12pm – 11:30pm' }` |
| `mapsEmbedUrl` | Maps → Share → Embed a map → `src` value | `https://www.google.com/maps/embed?...` |
| `mapsLink` | Shop's Maps place link (Share → Copy link) — powers "Get directions" / "Open in Google Maps" and the footer address link | `https://maps.app.goo.gl/...` |
| `socials` | Instagram / Facebook / YouTube profile URLs | `https://instagram.com/...` |

**Until `whatsapp` is filled in**, every "Order Now" button still builds the full message and opens
WhatsApp's composer so the customer can pick the chat. Once the number is added, the same buttons
open a direct chat with ZEESHAN — no other changes needed.

> **Current status:** the shop number **+91 7036369022** is configured for both tap-to-call (`phone`)
> and WhatsApp ordering (`whatsapp`), and the address is set to *Opposite Indian Oil Petrol Bunk, Near
> Ghati Center, Kakinada, Andhra Pradesh 533016*. No email address was supplied, so the Email row on
> `/contact` stays hidden — add `email` in `frontend/src/data/site.ts` and it appears automatically.

The same applies to the phone number: call buttons appear automatically once `phone` is set. Social
links only render when a URL exists, so there are no dead links.

---

## 2. Edit the menu

`frontend/src/data/menu.ts`

* `menuItems` — the five supplied items, **names preserved exactly**:
  `Chicken Pakodi`, `Chicken Joint`, `Chicken Lollipop`, `Reshma`, `Vuda`.
* `pricing` — the owner's rates, in one of two shapes:
  * **Chicken Pakodi is the only item sold by weight**:
    `{ unit: 'weight', prices: { '100g': 60, '250g': 150, '500g': 300 } }`. Customers pick
    100g / 250g / 500g on the card, in the order panel or in the bag.
  * **The other four are sold per piece**: `{ unit: 'piece', price: 60 }` —
    Joint ₹60, Reshma ₹30, Chicken Lollipop ₹25, Vuda ₹20. The quantity in the bag is the
    piece count.
  Every rate on the site (cards, chips, order panel, bag, checkout, WhatsApp message) is read
  from `pricing`; totals are calculated in `frontend/src/lib/price.ts`.
* `description` — short, editable copy.
* Add mutton dishes by appending items with `category: 'mutton'`. They appear in the Mutton filter.
* `chickenSpecials` powers the Chicken Specials section; each entry carries the `menuId` of its
  menu item so the price and weight options always come from `menuItems`. `muttonNote` is the
  editable mutton block.
* `PORTIONS` + `DEFAULT_PORTION` (top of `menu.ts`) are the weight options offered, and
  `default` is 250g.

No prices are printed anywhere else — every number comes from `menuItems.pricing`.

**Availability:** each item carries an `available` flag. `false` shows a *Sold out* badge, greys the
photo, and disables Add / Order Now everywhere (menu cards, specials, category chips, footer list);
a bag that already holds it is flagged and checkout is blocked until it is removed. In code set
`available: false`; day to day, use the **Sold out** switch in `/admin` (§3).

---

## 3. Menu manager — `/admin`

`/admin` is protected by a real login: **FastAPI + PostgreSQL** in [`backend/`](backend/README.md).
Nothing on the panel renders until the API accepts a username and password and returns a signed
token.

### Running it

```bash
# terminal 1 — the API (first run: see backend/README.md for setup + creating an admin)
cd backend && uvicorn app.main:app --reload --port 8000

# terminal 2 — the site
cd frontend && npm run dev
```

Then open **`/admin`**, sign in, and the manager appears:

| Action | How |
| --- | --- |
| **Mark sold out / available** | Click the gold **Available** / burgundy **Sold out** switch on any row. |
| **Add an item** | **Add new item** → name, category, *per piece* or *by weight* (100g/250g/500g prices), description, photo, badge, availability → **Add item**. |
| **Edit an item** | **Edit** → change any field, including prices → **Save changes**. |
| **Delete an item** | **Delete** → **Delete** again to confirm. |
| **Undo everything** | **Reset to shipped menu** → **Confirm reset**. |
| **Sign out** | The **Sign out** button beside **View menu**. |

### Accounts and sessions

* Accounts live in the `admin_users` table (PostgreSQL) — created with
  `python -m app.cli create-admin --username owner --role owner`.
* Passwords are hashed with scrypt (never stored or returned in plain text).
* Signing in returns a JWT (8 h by default) that the browser keeps in `sessionStorage`; it is
  re-checked against the API on every page load, so deactivating an account locks it out at once.
* Five wrong passwords in five minutes lock that username for five minutes.
* The panel sends `noindex, nofollow`, and `/api/docs` is the API's own documentation.

### Where the menu is saved

The panel still writes the menu to `localStorage` (`zeeshan:menu:v1`) in the browser that made the
change, so it applies immediately on that device. To publish a menu change for every visitor, use
**Copy menu.ts snippet** at the bottom of `/admin` and paste it over `menuItems` in
`frontend/src/data/menu.ts`, then redeploy. The login is server-side; moving the menu itself into
Postgres is the next step if you want live updates for all customers.

### Configuration

| Where | Variable | Meaning |
| --- | --- | --- |
| `frontend/.env.local` | `VITE_API_URL` | Base URL of the API, e.g. `https://admin-api.your-domain.com`. Defaults to `http://127.0.0.1:8000`. |
| `backend/.env` | `DATABASE_URL` | `postgresql://user:pass@host:5432/db` (or `sqlite:///./dev-admin.db` locally). |
| `backend/.env` | `JWT_SECRET` | 32+ random characters. **Required in production.** |
| `backend/.env` | `CORS_ORIGINS` | Comma-separated list of sites allowed to call the API. |
| `backend/.env` | `BOOTSTRAP_USERNAME` / `BOOTSTRAP_PASSWORD` | Optional: creates the first admin on first boot. |

> **Unreachable API?** The sign-in screen says so explicitly and shows a **Try again** button, so a
> stopped backend never looks like a wrong password.

---

## 4. Photography

The five dish photos in `frontend/public/images/` are **ZEESHAN's own** (originals kept in
`source-photos/`, outside the published bundle). They are shared across surfaces on purpose — one
file per dish, so replacing it updates the menu card, the Chicken Specials section, the gallery and
the About collage in one go:

| Dish | File | Also used on |
| --- | --- | --- |
| Chicken Lollipop | `menu-chicken-lollipop.jpg` | hero background, specials, gallery |
| Chicken Pakodi | `menu-chicken-pakodi.jpg` | specials, About (main), gallery |
| Chicken Joint | `menu-chicken-joint.jpg` | specials, Chicken category panel, gallery |
| Chicken Reshmi Kabab | `menu-reshma.jpg` | gallery |
| Chicken Vuda | `menu-vuda.jpg` | About (inset), gallery |

`category-mutton.jpg` is still a placeholder (no mutton photo supplied yet) — see `CREDITS.md`.

**To add or swap a photo**

1. Save a web-sized copy into `frontend/public/images/` (≤ 1600 px wide, JPEG ~75–80, keep the
   originals in `source-photos/`).
2. Point the matching entry in `frontend/src/data/images.ts` at it and update `alt`, `width`,
   `height`.
3. `/admin` lists the same photos in its **Photo** picker for new dishes.

> Still worth adding: a **storefront/shop photo** (the gallery's "Our Shop" tile is a styled card
> today) and a **mutton dish**. Drop them in and I can wire them up.

---

## 5. WhatsApp ordering & the order bag

1. Customer taps **Order Now** on any card, chip or footer link — or the **＋ Add** control that
   sits beside every item (menu cards, speciality cards, Mutton & Chicken chips and the footer menu
   list). Quick adds confirm in place with a tick and a gold "Added" state, no dialog needed.
2. The item panel opens with a quantity stepper and an optional request field:
   * **Add to Bag** — adds the line and opens the bag.
   * **Order this item on WhatsApp instead** — sends just that item immediately.
3. The **order bag page** at **`/bag`** (bag icon in the navbar, with a live count badge) shows the
   items on the left — photo, weight or piece count, quantity, line price, remove — and the
   **Order Summary** on the right with the **subtotal**, the **total amount**, **Proceed to
   Checkout**, **Continue Shopping** and the **Free Delivery / On orders above ₹1000** offer.
4. **Checkout** (`/checkout`) collects the delivery details, then **Place Order** opens WhatsApp with
   the whole order plus the address — one consolidated message, e.g.:

   ```
   Hello ZEESHAN!

   I would like to place an order:
   • 2 x Chicken Pakodi — 250g @ ₹150 = ₹300 (Extra spicy)
   • 6 x Chicken Joint @ ₹60/piece = ₹360

   Estimated total: ₹660

   Delivery details
   Name: Ali Khan
   Mobile: 7036369022
   Address: 12-A, Near the temple, Kochi, Kerala - 682001
   Email: ali@example.com

   Please confirm availability, delivery and the final total. Thank you!
   ```

The bag is written to `localStorage` **synchronously on every change** (`zeeshan:order-bag:v1`), so the
order list survives an instant refresh, a browser restart or a new tab (multiple tabs stay in sync).
If `localStorage` is blocked — e.g. some private-mode browsers — it falls back to `sessionStorage`.
Identical lines merge by item + note. The gold badge on the navbar bag icon shows how many items are
waiting.

**Routing / hosting:** every section is a real page (`/`, `/menu`, `/about`, `/chicken-specials`,
`/gallery`, `/contact`, `/bag`, `/checkout`, `/terms`, `/admin`) served by a tiny History-API router
(`frontend/src/lib/router.ts`) — no hash URLs, no router dependency. Unknown paths render a styled 404 page.
Internal links are intercepted so navigation happens inside the SPA, and `#anchor` links
(e.g. `/terms#cancellation`) scroll to the matching section. Static hosts must serve
`index.html` for these paths: `frontend/public/_redirects` (catch-all) covers Netlify and Cloudflare
Pages. On Vercel add a rewrite (`{ "source": "/(.*)", "destination": "/index.html" }`); on Apache use a
`.htaccess` fallback.

| Route | Page |
| --- | --- |
| `/` | Home — hero, marquee, page shortcuts, why ZEESHAN |
| `/menu` | Menu — signature items with prices + Mutton & Chicken |
| `/about` | About ZEESHAN |
| `/chicken-specials` | Chicken Specials |
| `/gallery` | Food gallery |
| `/contact` | Contact & location |
| `/bag` | Order bag + summary |
| `/checkout` | Delivery form + summary + Place Order |
| `/terms` | Terms & Conditions (linked from the footer + checkout checkbox) |
| `/admin` | Menu manager — staff sign-in (FastAPI + PostgreSQL), add / edit / delete items, sold out, export |

Templates live in `frontend/src/lib/whatsapp.ts` (`buildOrderMessage`, `buildBagMessage`,
`buildCheckoutMessage`, `buildContactMessage`, `buildEnquiryMessage`).

**Contact form:** `/contact` keeps the shop details on the left and a **WhatsApp enquiry form** on the
right (`frontend/src/components/forms/ContactForm.tsx`) — Name\*, Phone Number, Email, Description\*,
then **Send via WhatsApp**. Name and Description are required; phone/email are optional but validated
when filled. The map sits full-width beneath both columns.

**Delivery promo:** `business.delivery.banner` — *"Orders above ₹1000 get FREE DELIVERY"* — powers the
slim burgundy bar above the navbar on every page (`components/layout/TopBar.tsx`) and the matching
strip at the top of the footer. `business.delivery.note` ("On orders above ₹1000") is used inside the
order summaries.

**Form validation:** every field on `/checkout` and `/contact` is validated — required checks,
min/max lengths, name/place character rules, 6-digit pincode (not starting with 0), 10-digit mobile
(with optional +91), email format, and a minimum message length. Errors show on blur and on submit,
and the first invalid field is focused. The contact form also requires at least one of phone/email.
Rules live in `frontend/src/lib/validation.ts`; pincode/mobile inputs strip disallowed characters as
you type.

---

## 6. Structure

```
frontend/
  index.html                  Vite entry (meta tags, preload, JSON-LD)
  public/                     static assets served as-is
    images/                   dish photography (one file per dish, reused)
    favicon.svg · _redirects  SPA fallback for static hosts
  src/
    App.tsx                   route switch (path → page)
    main.tsx                  React root
    index.css                 Tailwind layers, design tokens, reveal/animation utilities
    data/
      site.ts                 ← all editable business information
      menu.ts                 ← menu items, specials, mutton block, features
      images.ts               ← single image registry (paths + alt text)
      navigation.ts           ← nav links (path-based routes)
      legal.ts                ← Terms & Conditions copy (one entry per section)
    lib/
      router.ts               navigate / usePathname / link interception / #anchor scrolling
      api.ts                  admin API client + token storage (sessionStorage)
      menuStore.ts            menu persistence (localStorage) + JSON / menu.ts export
      price.ts                ₹ formatting, line totals, bag subtotal
      phone.ts                mobile normalisation + validation
      validation.ts           shared field validators for the checkout + contact forms
      whatsapp.ts             wa.me / tel builders + message templates
      cn.ts                   class-name helper
    hooks/
      useLockBodyScroll.ts    drawer + modal scroll locking
      useAdminAuth.ts         sign-in / session / sign-out state for /admin
    components/
      layout/                 Navbar, TopBar, Footer, SiteLayout, FloatingActions
      sections/               Hero, SignatureMenu, ChickenSpecials, MuttonChicken,
                              About, WhyChoose, Gallery, Contact, MarqueeStrip, ExplorePages
      order/                  OrderContext + OrderModal (item panel),
                              BagContext (bag state + persistence)
      menu/                   MenuContext — live menu + availability for the whole app
      admin/                  AdminLogin (sign-in card), ItemForm (add / edit a dish)
      forms/                  ContactForm (contact-page WhatsApp enquiry)
      ui/                     Reveal, SectionHeading, SmartImage
    pages/
      HomePage.tsx            /
      MenuPage.tsx            /menu
      AboutPage.tsx           /about
      SpecialsPage.tsx        /chicken-specials
      GalleryPage.tsx         /gallery
      ContactPage.tsx         /contact
      BagPage.tsx             /bag — items, order summary, checkout
      CheckoutPage.tsx        /checkout — delivery form + order summary
      TermsPage.tsx           /terms — Terms & Conditions (+ on-page index)
      AdminPage.tsx           /admin — sign-in gate + menu manager
      NotFoundPage.tsx        any unknown path
  package.json · vite.config.ts · tsconfig*.json · tailwind.config.js · postcss.config.js
  .env.example                copy to .env.local (VITE_API_URL)
  Dockerfile · nginx.conf · .dockerignore

backend/                      FastAPI + PostgreSQL auth service (see backend/README.md)
  app/main.py                 app, CORS, startup (schema + optional bootstrap), /api/health
  app/routers/auth.py         login (throttled), me, logout, change-password
  app/security.py             scrypt password hashing + JWT signing
  app/db.py                   PostgreSQL (psycopg) / SQLite dev connections + schema
  app/cli.py                  create-admin / reset-password / list-admins / deactivate
  tests/test_auth.py          13 API tests
  Dockerfile · .dockerignore

docker-compose.yml            db + api + web (see “Docker” above)
.env.example                  compose variables → copy to .env
source-photos/                original photographs (not published, gitignored)
```

The **site itself is a static bundle** (`frontend/dist/`) — menu, gallery, bag and checkout need no
server. The only server-side part is the **admin login** in `backend/`: it stores admin accounts in
PostgreSQL and issues the token that unlocks `/admin`.

---

## 7. Design system

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#111111` | page background |
| `night` | `#171717` | cards / alternate sections |
| `coal` | `#0B0B0B` | deepest contrast, hero vignette |
| `gold` | `#D6A84B` | borders, labels, CTAs |
| `gold-light` | `#F5C76B` | italic accents, hover states |
| `burgundy` | `#641C20` | accent band, glows |
| `cream` | `#FFF6E8` | primary text |

Typography: **Bodoni Moda** (editorial display) + **Inter** (UI/body), served by Google Fonts with
preconnect and `display=swap`.

Motion: one `Reveal` component drives every scroll entrance through `IntersectionObserver`, and all
animation is disabled under `prefers-reduced-motion`.

---

## 8. Accessibility, performance & SEO

* Semantic landmarks, a single `h1`, labelled navigation and dialogs, `aria-expanded` hamburger,
  focus-trapped order modal and gallery lightbox, `Escape` to close, and a skip-to-content link.
* Every image has descriptive alt text; below-the-fold images lazy-load with reserved aspect ratios
  (no layout shift) and fade in when ready.
* **SEO:** title, meta description, keywords, canonical, Open Graph + Twitter cards, `theme-color`,
  `robots.txt`, `noscript` summary and **Restaurant / LocalBusiness JSON-LD** in `index.html`.
* Structured data deliberately omits address, phone and opening hours. Add them to the JSON-LD in
  `index.html` only once they are confirmed — unverified data can harm local ranking.

---

## 9. Deploy

**Static site:** `cd frontend && npm run build` produces `frontend/dist/` — point the static host at
that folder (Netlify, Vercel, Cloudflare Pages, or any static host).

| Host | Build command | Publish directory |
| --- | --- | --- |
| Netlify | `npm run build` | `frontend/dist` |
| Vercel | `npm run build` | `frontend/dist` |
| Cloudflare Pages | `npm run build` | `frontend/dist` |

Set the static host's **root/base directory** to `frontend` (or configure the commands above plus
`frontend` as the base). Add `VITE_API_URL` to the host's environment variables.

### Deploying the admin API (for `/admin` sign-in)

1. **PostgreSQL** — create a database on any managed Postgres (Render, Railway, Fly, Neon, Supabase)
   and copy its connection string.
2. **API** — deploy the `backend/` folder to a Python host (Render/Railway/Fly “web service”):
   * build: `pip install -r requirements.txt`
   * start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * env: `ENVIRONMENT=production`, `DATABASE_URL=…`, `JWT_SECRET=<48 random chars>`,
     `CORS_ORIGINS=https://your-live-site.com`
3. **First admin** — from the host's shell (or locally against the same `DATABASE_URL`):
   `python -m app.cli create-admin --username owner --role owner`
4. **Frontend** — set `VITE_API_URL=https://your-api-host` in the static host's environment
   variables, then rebuild/redeploy.
5. Open `https://your-live-site.com/admin` and sign in.

Checklist for the login:

- [ ] `JWT_SECRET` set to a long random value (the API refuses to start in production otherwise)
- [ ] `CORS_ORIGINS` lists the live site only
- [ ] `BOOTSTRAP_PASSWORD` cleared from the environment once the first admin exists
- [ ] Password changed from the temporary one via `/api/auth/change-password` (or the CLI)
- [ ] API health check (`/api/health`) monitored by the host

Before launch:

- [x] WhatsApp number and phone number added (`+91 7036369022`)
- [x] Address added (`addressLine` / `addressArea`) and wired to the shop's Google Maps listing
      (`mapsLink` → every "Get directions" / "Open in Google Maps" button, plus `hasMap` in JSON-LD)
- [ ] Business hours and social links filled in
- [ ] Google Maps **embed** added (`mapsEmbedUrl`) — the map card currently shows the styled
      placeholder with a working directions button
- [x] Prices published — Pakodi by weight (100g ₹60 / 250g ₹150 / 500g ₹300); Joint ₹60,
      Reshma ₹30, Lollipop ₹25, Vuda ₹20 per piece
- [ ] Menu manager reviewed with the owner (`/admin` — sold-out switch + export workflow)
- [ ] Reshma / Vuda descriptions confirmed by the owner
- [x] Dish photography replaced with ZEESHAN's own photos (storefront + a mutton shot still pending)
- [ ] `og:image` and the JSON-LD address/phone updated in `index.html`
- [x] Refund Policy link added — the Terms & Conditions page (`/terms`, copy in
      `frontend/src/data/legal.ts`) is linked from the checkout checkbox, the footer and the site index


