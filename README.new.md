# Holiday Gift 2025

A single-page skeuomorphic holiday greeting card built with Next.js App Router, TypeScript, and js-dos (Doom gag embed). Designed for Vercel.

## Getting Started

1. Copy environment example and edit values:

```
cp .env.local.example .env.local
```

2. Install dependencies and run the dev server:

```
npm install
npm run dev
```

3. Open http://localhost:3000

Optionally append `?id=<your-id>` to load a specific gift via the API, for example:

```
http://localhost:3000/?id=friend1
```

## Environment variables

- `MYSTERY`: Stringified JSON map of gift data. Parsed once at module load on the server.
- `NEXT_PUBLIC_DOOM`: Public URL to a js-dos bundle (zip) for Doom 1 shareware.

See `.env.local.example` for structure and dummy values.

### Vercel setup

Add these variables in your Vercel Project Settings → Environment Variables:

- `MYSTERY` (Production, Preview, Development)
- `NEXT_PUBLIC_DOOM` (Public)

Redeploy to apply changes.

## API

GET `/api/gift?id=<string>` → `200` with `GiftDetails` when found, otherwise `404` JSON error.

## Frontend

- Full-screen blurred living room background.
- Centered card opens permanently on click/hover with CSS 3D flip.
- Inside right page shows name/message/games/footer/signature and the Doom embed.

## Build and deploy

```
npm run build
npm start
```

On Vercel, the default build/run config works (`next build`, `next start`).

## Notes

- Placeholder images live under `/public/images` and may be `.svg` vector assets.
- Package name is `@jaycanuck/holidaygift2025` and marked `private`.
