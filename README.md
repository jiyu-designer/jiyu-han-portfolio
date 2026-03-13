# Jiyu Han — Portfolio

Personal portfolio of Jiyu Han, a creative developer building at the intersection of AI, generative art, and interactive experiences.

**Live:** https://jiyuhan.com

---

## Projects

| Project | Description | Tech |
|---------|-------------|------|
| **Let it Jazz** | AI-curated jazz music player with YouTube API, coverflow album UI, and ambient gradient visuals | Next.js, YouTube Data API v3, Swiper |
| **Beyond with Humanity** | Parallax gallery of AI-generated artworks | Next.js, Framer Motion |
| **Moving** | Four interactive media art visualizations (particle text, flowmap, liquid background, ocean waves) | Three.js, OGL, Canvas 2D |
| **Nostalgia** | Virtual jewelry brand — 3D lookbook, scroll-driven zoom gallery, product showcase | Next.js, Framer Motion, Three.js |
| **LinkStash** | SaaS link management app | Next.js |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS, CSS Modules
- **Animation:** Framer Motion
- **3D / WebGL:** Three.js, OGL
- **Fonts:** Poppins, Montserrat (Google Fonts)
- **Deployment:** Vercel

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Then fill in your YOUTUBE_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key — used to fetch the Let it Jazz playlist |

See `.env.local.example` for the template.

---

## Build & Deploy

```bash
npm run build   # production build
npm run start   # start production server locally
```

Deployed automatically via Vercel on push to `main`.
