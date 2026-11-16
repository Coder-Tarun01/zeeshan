# ZEESHAN — Mutton & Chicken

A premium, fully responsive single-page website for **ZEESHAN Mutton & Chicken** — a chicken and
non-veg food outlet. Built with **React + TypeScript + Tailwind CSS + Lucide icons**, with a
functional WhatsApp ordering flow.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # type-check + production build into /dist
npm run preview  # preview the production build on http://localhost:5175
```

Requires Node 18+.

---

## 1. Add the real business details (do this first)

Everything factual lives in **`src/data/site.ts`**. Fields left empty render a graceful, honest
fallback — nothing is invented.

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
> `/contact` stays hidden — add `email` in `src/data/site.ts` and it appears automatically.

The same applies to the phone number: call buttons appear automatically once `phone` is set. Social
links only render when a URL exists, so there are no dead links.

---

## 2. Edit the menu

`src/data/menu.ts`

* `menuItems` — the five supplied items, **names preserved exactly**:
  `Chicken Pakodi`, `Chicken Joint`, `Chicken Lollipop`, `Reshma`, `Vuda`.
* `price` is `null` on purpose → the UI shows "Price on ask". Set a string (e.g. `'₹120'`) to publish.
* `description` — short, editable copy. Reshma and Vuda are intentionally left open ("ask us for
  today's preparation") until the owner confirms those dishes. Update those two first.
* Add mutton dishes by appending items with `category: 'mutton'`. They appear in the Mutton filter.
* `chickenSpecials` powers the Chicken Specials section; `muttonNote` is the editable mutton block.
* **Portions:** every item is sold in **100g / 250g / 500g** (`PORTIONS` + `DEFAULT_PORTION` at the top
  of `menu.ts`). Customers pick the weight on the card, in the order panel or in the bag. A single
  item can offer a different list by adding `portions: ['500g', '1kg']` — the rest keep the default.

No prices, timings, certifications or history claims are hard-coded anywhere else.

---

## 3. Replace the photography

The delivered photos are **representative placeholder photography** (see `CREDITS.md`). Swap them
for ZEESHAN's own shots:

1. Drop files into `public/images/`
2. Update the matching path in `src/data/images.ts` (and the alt text)

| Purpose | File | Suggested size |
| --- | --- | --- |
| Hero background | `hero-chicken-lollipop.jpg` | 1800 × 1350 |
| Menu cards (5) | `menu-*.jpg` | 900 × 675 |
| Chicken specials | `special-*.jpg` | 1100 × 825 |
| Category panels | `category-chicken.jpg`, `category-mutton.jpg` | 1000 × 750 |
| About collage | `about-main.jpg`, `about-inset.jpg` | 1100 × 825 / 700 × 1050 |
| Gallery | `gallery-01.jpg` … `gallery-07.jpg` | 1000 × 750 |

The **storefront photo** belongs in the gallery brand tile and the About collage. Drop it in as
`public/images/storefront.jpg`, then replace the "Our Shop" card in
`src/components/sections/Gallery.tsx` with a `SmartImage`.

---

## 4. WhatsApp ordering & the order bag

1. Customer taps **Order Now** on any card, chip or footer link — or the **＋ Add** control that
   sits beside every item (menu cards, speciality cards, Mutton & Chicken chips and the footer menu
   list). Quick adds confirm in place with a tick and a gold "Added" state, no dialog needed.
2. The item panel opens with a quantity stepper and an optional request field:
   * **Add to Bag** — adds the line and opens the bag.
   * **Order this item on WhatsApp instead** — sends just that item immediately.
3. The **order bag page** at **`/bag`** (bag icon in the navbar, with a live count badge) shows the
   items on the left — photo, weight, quantity, price, remove — and the **Order Summary** on the
   right with subtotal, **total amount**, **Proceed to Checkout**, **Continue Shopping** and the
   **Free Delivery / On orders above ₹1000** offer.
4. **Checkout** (`/checkout`) collects the delivery details, then **Place Order** opens WhatsApp with
   the whole order plus the address — one consolidated message, e.g.:

   ```
   Hello ZEESHAN!

   I would like to place an order:
   • 2 x Chicken Pakodi — 250g (Extra spicy)
   • 1 x Vuda — 500g

   Delivery details
   Name: Ali Khan
   Mobile: 7036369022
   Address: 12-A, Near the temple, Kochi, Kerala - 682001
   Email: ali@example.com

   Please confirm availability, the total and delivery. Thank you!
   ```

The bag is written to `localStorage` **synchronously on every change** (`zeeshan:order-bag:v1`), so the
order list survives an instant refresh, a browser restart or a new tab (multiple tabs stay in sync).
If `localStorage` is blocked — e.g. some private-mode browsers — it falls back to `sessionStorage`.
Identical lines merge by item + note. The gold badge on the navbar bag icon shows how many items are
waiting.

**Routing / hosting:** every section is a real page (`/`, `/menu`, `/about`, `/chicken-specials`,
`/gallery`, `/contact`, `/bag`, `/checkout`, `/terms`) served by a tiny History-API router
(`src/lib/router.ts`) — no hash URLs, no router dependency. Unknown paths render a styled 404 page.
Internal links are intercepted so navigation happens inside the SPA, and `#anchor` links
(e.g. `/terms#cancellation`) scroll to the matching section. Static hosts must serve
`index.html` for these paths: `public/_redirects` (catch-all) covers Netlify and Cloudflare Pages.
On Vercel add a rewrite (`{ "source": "/(.*)", "destination": "/index.html" }`); on Apache use a
`.htaccess` fallback.

| Route | Page |
| --- | --- |
| `/` | Home — hero, marquee, page shortcuts, why ZEESHAN |
| `/menu` | Menu — signature items with portions + Mutton & Chicken |
| `/about` | About ZEESHAN |
| `/chicken-specials` | Chicken Specials |
| `/gallery` | Food gallery |
| `/contact` | Contact & location |
| `/bag` | Order bag + summary |
| `/checkout` | Delivery form + summary + Place Order |
| `/terms` | Terms & Conditions (linked from the footer + checkout checkbox) |

Templates live in `src/lib/whatsapp.ts` (`buildOrderMessage`, `buildBagMessage`, `buildCheckoutMessage`,
`buildContactMessage`, `buildEnquiryMessage`).

**Contact form:** `/contact` keeps the shop details on the left and a **WhatsApp enquiry form** on the
right (`src/components/forms/ContactForm.tsx`) — Name\*, Phone Number, Email, Description\*, then
**Send via WhatsApp**. Name and Description are required; phone/email are optional but validated when
filled. The map sits full-width beneath both columns.

**Delivery promo:** `business.delivery.banner` — *"Orders above ₹1000 get FREE DELIVERY"* — powers the
slim burgundy bar above the navbar on every page (`components/layout/TopBar.tsx`) and the matching
strip at the top of the footer. `business.delivery.note` ("On orders above ₹1000") is used inside the
order summaries.

**Form validation:** every field on `/checkout` and `/contact` is validated — required checks,
min/max lengths, name/place character rules, 6-digit pincode (not starting with 0), 10-digit mobile
(with optional +91), email format, and a minimum message length. Errors show on blur and on submit,
and the first invalid field is focused. The contact form also requires at least one of phone/email.
Rules live in `src/lib/validation.ts`; pincode/mobile inputs strip disallowed characters as you type.

---

## 5. Structure

```
src/
  App.tsx                     route switch (path → page)
  index.css                   Tailwind layers, design tokens, reveal/animation utilities
  data/
    site.ts                   ← all editable business information
    menu.ts                   ← menu items, specials, mutton block, features
    images.ts                 ← single image registry (paths + alt text)
    navigation.ts             ← nav links (path-based routes)
    legal.ts                  ← Terms & Conditions copy (one entry per section)
  lib/
    router.ts                 navigate / usePathname / link interception / #anchor scrolling
    phone.ts                  mobile normalisation + validation
    validation.ts             shared field validators for the checkout + contact forms
    whatsapp.ts               wa.me / tel builders + message templates
    cn.ts                     class-name helper
  hooks/
    useLockBodyScroll.ts      drawer + modal scroll locking
  components/
    layout/                   Navbar, TopBar, Footer, SiteLayout, FloatingActions
    sections/                 Hero, SignatureMenu, ChickenSpecials, MuttonChicken,
                              About, WhyChoose, Gallery, Contact, MarqueeStrip, ExplorePages
    order/                    OrderContext + OrderModal (item panel),
                              BagContext (bag state + persistence)
    forms/                    ContactForm (contact-page WhatsApp enquiry)
    ui/                       Reveal, SectionHeading, SmartImage
  pages/
    HomePage.tsx              /
    MenuPage.tsx              /menu
    AboutPage.tsx             /about
    SpecialsPage.tsx          /chicken-specials
    GalleryPage.tsx           /gallery
    ContactPage.tsx           /contact
    BagPage.tsx               /bag — items, order summary, checkout
    CheckoutPage.tsx          /checkout — delivery form + order summary
    TermsPage.tsx             /terms — Terms & Conditions (+ on-page index)
    NotFoundPage.tsx          any unknown path
```

There is no backend or database — the build output in `dist/` is a static bundle.

---

## 6. Design system

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

## 7. Accessibility, performance & SEO

* Semantic landmarks, a single `h1`, labelled navigation and dialogs, `aria-expanded` hamburger,
  focus-trapped order modal and gallery lightbox, `Escape` to close, and a skip-to-content link.
* Every image has descriptive alt text; below-the-fold images lazy-load with reserved aspect ratios
  (no layout shift) and fade in when ready.
* **SEO:** title, meta description, keywords, canonical, Open Graph + Twitter cards, `theme-color`,
  `robots.txt`, `noscript` summary and **Restaurant / LocalBusiness JSON-LD** in `index.html`.
* Structured data deliberately omits address, phone and opening hours. Add them to the JSON-LD in
  `index.html` only once they are confirmed — unverified data can harm local ranking.

---

## 8. Deploy

`npm run build` produces a static `dist/` folder: deploy to Netlify, Vercel, Cloudflare Pages or any
static host.

Before launch:

- [x] WhatsApp number and phone number added (`+91 7036369022`)
- [x] Address added (`addressLine` / `addressArea`) and wired to the shop's Google Maps listing
      (`mapsLink` → every "Get directions" / "Open in Google Maps" button, plus `hasMap` in JSON-LD)
- [ ] Business hours and social links filled in
- [ ] Google Maps **embed** added (`mapsEmbedUrl`) — the map card currently shows the styled
      placeholder with a working directions button
- [ ] Prices confirmed (or intentionally left as "Price on ask")
- [ ] Reshma / Vuda descriptions confirmed by the owner
- [ ] Real photography in `public/images/` (including the storefront)
- [ ] `og:image` and the JSON-LD address/phone updated in `index.html`
- [x] Refund Policy link added — the Terms & Conditions page (`/terms`, copy in
      `src/data/legal.ts`) is linked from the checkout checkbox, the footer and the site index


