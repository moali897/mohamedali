# Mohammed Ali — AI Film Portfolio

Bilingual (Arabic / English) video portfolio. Next.js on Vercel, with project data and contact leads in Supabase.

## How it works

- **Videos** live in `public/media/`:
  - `videos/<slug>.mp4` — the full ad (720p, web-optimized)
  - `loops/<slug>.mp4` — a 5-second silent loop that plays on the grid card
  - `posters/<slug>.jpg` — the cover image
- **Projects list** comes from the Supabase table `projects` (falls back to `lib/projects.js` if Supabase is unreachable). Edit titles, order (`sort_order`) or hide a project (`published = false`) from the Supabase Table Editor; the site picks up changes within 5 minutes.
- **Contact form** saves to the Supabase table `leads` (Table Editor → leads), and the WhatsApp button opens a chat on 01556414380.

## Add a new video

1. Encode the full video (example):
   `ffmpeg -i input.mp4 -vf scale=1280:-2 -c:v libx264 -crf 27 -maxrate 2M -bufsize 4M -c:a aac -b:a 112k -movflags +faststart public/media/videos/<slug>.mp4`
   (use `scale=-2:1280` for vertical videos)
2. Make a 5s loop: `ffmpeg -ss 10 -t 5 -i input.mp4 -an -vf scale=640:-2,fps=24 -crf 30 public/media/loops/<slug>.mp4`
3. Make a poster: `ffmpeg -ss 10 -i input.mp4 -frames:v 1 public/media/posters/<slug>.jpg`
4. Add a row to the `projects` table in Supabase with the same `<slug>` paths, then push to GitHub.

## Edit text

All copy (Arabic + English), WhatsApp number, clients and the course link are in `lib/i18n.js`.

## Environment variables (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # the publishable key
NEXT_PUBLIC_SITE_URL=            # e.g. https://your-domain.com
```

## Local

```
npm install
npm run dev
```
