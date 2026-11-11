# Mohammed Ali — AI Film Portfolio

Bilingual (Arabic / English) video portfolio. Next.js on Vercel, with project data and contact leads in Supabase.

## How it works

- **Videos** live in `public/media/`:
  - `hls/<slug>/` — the full ad as adaptive streaming (HLS: 720p / 540p / 360p). The player starts at the
    quality the connection can handle and switches up or down while playing, so it doesn't stall.
  - `loops/<slug>.mp4` — a 5-second silent loop that plays on the grid card
  - `posters/<slug>.jpg` — the cover image
- **Projects list** comes from the Supabase table `projects` (falls back to `lib/projects.js` if Supabase is unreachable). Edit titles, order (`sort_order`) or hide a project (`published = false`) from the Supabase Table Editor; the site picks up changes within 5 minutes.
- **Contact form** saves to the Supabase table `leads` (Table Editor → leads), and the WhatsApp button opens a chat on 01556414380.

## Add a new video

1. Encode the full video to HLS (landscape example; for vertical swap to `-2:1280`, `-2:960`, `-2:640`):
   ```
   mkdir -p public/media/hls/<slug>
   ffmpeg -i input.mp4 -filter_complex "[0:v]fps=25,split=3[a][b][c];[a]scale=1280:-2[v1];[b]scale=960:-2[v2];[c]scale=640:-2[v3]" \
     -map "[v1]" -map 0:a -map "[v2]" -map 0:a -map "[v3]" -map 0:a \
     -c:v libx264 -preset veryfast -profile:v main -pix_fmt yuv420p -g 50 -keyint_min 50 -sc_threshold 0 \
     -b:v:0 2400k -maxrate:v:0 2800k -bufsize:v:0 4800k -b:v:1 1200k -maxrate:v:1 1400k -bufsize:v:1 2400k \
     -b:v:2 550k -maxrate:v:2 650k -bufsize:v:2 1100k -c:a aac -b:a 96k -ac 2 \
     -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_type fmp4 -hls_flags single_file+independent_segments \
     -master_pl_name master.m3u8 -var_stream_map "v:0,a:0,name:720 v:1,a:1,name:540 v:2,a:2,name:360" \
     -hls_segment_filename "public/media/hls/<slug>/%v.m4s" "public/media/hls/<slug>/%v.m3u8"
   ```
2. Make a 5s loop: `ffmpeg -ss 10 -t 5 -i input.mp4 -an -vf scale=640:-2,fps=24 -crf 30 public/media/loops/<slug>.mp4`
3. Make a poster: `ffmpeg -ss 10 -i input.mp4 -frames:v 1 public/media/posters/<slug>.jpg`
4. Add a row to the `projects` table in Supabase (`video_url` = `/media/hls/<slug>/master.m3u8`), then push to GitHub.

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
