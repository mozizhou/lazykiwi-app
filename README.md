# LazyKiwi App

Workbench application for [LazyKiwi](https://app.lazykiwi.ai).

## Routes

- `/` → `/app/video-generator`
- `/app/[tool]` — 12 AI tools
- `/login`, `/settings`, `/auth/callback`

## Local development

```powershell
npm install
copy .env.local.example .env.local
npm run dev -- -p 3001
```

`NEXT_PUBLIC_SITE_URL` points to marketing site (`http://localhost:3000`) for sidebar home link.

## Production

- Domain: `https://app.lazykiwi.ai`
- PM2: `lazykiwi-app` on port `3002`
