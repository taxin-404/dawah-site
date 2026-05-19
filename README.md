# دعوة · দাওয়াহ · Dawah Site

A blazing-fast Islamic dawah website built with **Astro**, hosted free on **Cloudflare Pages**, articles stored in **Firebase Firestore**, and images on **ImgBB**.

---

## 🚀 Tech Stack (100% Free)

| Service | Purpose | Free Tier |
|---|---|---|
| [Astro](https://astro.build) | Frontend SSG/SSR | Open source |
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting + CDN | Unlimited bandwidth |
| [Firebase Firestore](https://firebase.google.com) | Articles database | 1GB storage, 50k reads/day |
| [ImgBB](https://imgbb.com) | Image hosting | Unlimited uploads |

---

## 📁 Project Structure

```
dawah-site/
├── src/
│   ├── components/
│   │   ├── Header.astro       # Sticky nav + language switcher
│   │   ├── Hero.astro         # Bismillah hero section
│   │   ├── ArticleCard.astro  # Article card component
│   │   └── Footer.astro       # Footer with Quran ayah
│   ├── layouts/
│   │   └── BaseLayout.astro   # HTML shell with lang/dir/SEO
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   ├── articles/
│   │   │   ├── index.astro    # Articles list + tag filter
│   │   │   └── [slug].astro   # Single article page
│   │   └── admin/
│   │       └── index.astro    # Admin panel (write/delete articles)
│   ├── lib/
│   │   ├── firebase.ts        # Firestore helpers
│   │   └── imgbb.ts           # Image upload utility
│   ├── i18n/
│   │   └── ui.ts              # EN / BN / AR translations
│   └── styles/
│       └── global.css         # Islamic design system
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── wrangler.toml              # Cloudflare config
└── .env.example
```

---

## ⚙️ Setup Guide

### 1. Clone & install
```bash
git clone <your-repo>
cd dawah-site
npm install
```

### 2. Firebase setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → **Add Web App**
3. Copy the config values
4. Go to **Firestore Database** → Create database → Start in **production mode**
5. Go to the **Rules** tab and replace everything with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Articles ─────────────────────────────────────────────────────
    match /articles/{articleId} {

      // Anyone can READ a published article (your website visitors)
      allow read: if resource.data.published == true;

      // Only a logged-in + email-verified admin can write
      allow create: if request.auth != null
                    && request.auth.token.email_verified == true
                    && isValidArticle(request.resource.data);

      allow update: if request.auth != null
                    && request.auth.token.email_verified == true;

      allow delete: if request.auth != null
                    && request.auth.token.email_verified == true;
    }
  }

  // ── Validate required fields on create ───────────────────────────
  function isValidArticle(data) {
    return data.keys().hasAll(['slug', 'title', 'published', 'publishedAt'])
      && data.slug is string
      && data.slug.size() > 0
      && data.slug.size() < 200
      && data.title is map
      && data.published is bool;
  }
}
```

6. Click **Publish**

### 🔒 What these rules do

| Rule | Who | Why |
|---|---|---|
| `allow read` if `published == true` | Everyone | Visitors see published articles, drafts stay hidden |
| `allow create/update/delete` | Logged-in + email verified only | Only your admin account can write to the DB |
| `isValidArticle()` validator | On create only | Blocks junk or malformed data from being saved |

> ⚠️ **Never use `allow read, write: if true`** — that makes your entire database public and writable by anyone on the internet.

> 💡 **Test before going live:** Firebase Console → Firestore → Rules → **Rules Playground** — simulate a read/write and see if it passes or gets blocked.

### 3. ImgBB setup
1. Go to [api.imgbb.com](https://api.imgbb.com/) and sign up free
2. Get your API key

### 4. Environment variables
```bash
cp .env.example .env
# Fill in all values in .env
```

### 5. Run locally
```bash
npm run dev
# → http://localhost:4321
```

### 6. Deploy to Cloudflare Pages
```bash
# First time: login to Cloudflare
npx wrangler login

# Build & deploy
npm run deploy
```

Or connect your **GitHub repo** to Cloudflare Pages for auto-deploy on every push:

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your GitHub/GitLab repo → click **Begin setup**
3. On the build settings screen, fill in exactly:

| Setting | Value |
|---|---|
| **Framework preset** | `Astro` ← pick from dropdown, do not leave as "None" |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | *(leave blank)* |

4. Still on that same screen, scroll down to **Environment Variables (advanced)** and add:

| Variable | Value | Type |
|---|---|---|
| `NODE_VERSION` | `20` | Plaintext |

> This is how Cloudflare knows which Node.js version to use — there is no dropdown for it. If you skip this, Cloudflare may use an old Node version and the Astro build will fail.

> ⚠️ If you accidentally leave Framework preset as **None**, Cloudflare won't know how to build Astro and the deployment will fail. Always select **Astro**.

---

## 🔐 Setting Environment Variables on Cloudflare Pages

Cloudflare Pages does **not** read your local `.env` file — you must add every variable manually in the dashboard.

### Step-by-step

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Click your project name (e.g. `dawah-site`)
4. Go to **Settings → Environment Variables**
5. Click **Add variable** for each one below:

### 📋 Plaintext or Secret?

Cloudflare gives you two options when adding a variable:

- **Plaintext** → value is visible in the dashboard anytime. Use for non-sensitive config.
- **Secret (Encrypt)** → value is hidden after saving, stored encrypted. Use for API keys.

Here is exactly what to pick for each variable:

| Variable Name | Type | Where to find it |
|---|---|---|
| `NODE_VERSION` | **Plaintext** | Just type `20` — tells Cloudflare which Node.js to use |
| `PUBLIC_FIREBASE_API_KEY` | **Plaintext** | Firebase Console → Project Settings → Your Apps |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | **Plaintext** | Same as above |
| `PUBLIC_FIREBASE_PROJECT_ID` | **Plaintext** | Same as above |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | **Plaintext** | Same as above |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | **Plaintext** | Same as above |
| `PUBLIC_FIREBASE_APP_ID` | **Plaintext** | Same as above |
| `PUBLIC_IMGBB_API_KEY` | **Secret** | [api.imgbb.com](https://api.imgbb.com) → API |
| `PUBLIC_SITE_URL` | **Plaintext** | Your Cloudflare Pages URL e.g. `https://dawah-site.pages.dev` |

> 💡 **Why Plaintext for Firebase?** Firebase client config is *designed* to be public — it is embedded directly in your website's HTML that anyone can view. Firebase security is enforced by Firestore Rules, not by hiding the config. Plaintext makes it easier to edit later.
>
> 💡 **Why Secret for ImgBB?** Your ImgBB key allows uploading images to your account, so it is better to keep it hidden in the dashboard.

6. Set each variable for **both** `Production` and `Preview` environments
7. Click **Save**
8. Go to **Deployments → Retry deployment** (or push a new commit) so the build picks up the new variables

> ⚠️ **Important:** Any variable starting with `PUBLIC_` is exposed to the browser. Never put secret admin keys here — only Firebase client-side config and ImgBB API key, which are safe to expose.

### If deploying via `wrangler` CLI instead

Add your variables to `wrangler.toml` under `[vars]`, **or** set them as Cloudflare secrets:
```bash
npx wrangler pages secret put PUBLIC_FIREBASE_API_KEY
# Paste the value when prompted — repeating for each variable
```

---

## 📝 Writing Articles

Go to `/admin` on your site. You can:
- Write content in **English**, **বাংলা**, and **العربية**
- Upload images (auto-hosted on ImgBB)
- Set tags, featured status, author
- Delete articles

---

## 🌍 i18n (Multilingual)

| Language | URL |
|---|---|
| English | `yourdomain.com/` |
| বাংলা | `yourdomain.com/bn/` |
| العربية | `yourdomain.com/ar/` |

RTL is automatically applied for Arabic via `dir="rtl"` on `<html>`.

---

## 🎨 Design System

Islamic aesthetic with:
- **Colors**: Deep forest green + gold + cream
- **Fonts**: Amiri (Arabic) · Hind Siliguri (Bengali) · Cormorant Garamond (English)
- **Pattern**: Islamic geometric star pattern (pure CSS/SVG)
- **Bismillah** displayed prominently in every article

---

> وَادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ
> 
> *"Invite to the way of your Lord with wisdom and good instruction."* — Surah An-Nahl 16:125
