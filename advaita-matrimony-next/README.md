# Advaita Matrimony Web

Modern Next.js public website for Advaita Matrimony.

## Stack

- Next.js + React + TypeScript
- Faithful bento design language from `frontend-preview/index.html`
- Repository hero video served through the Next media route
- Laravel remains the backend, database, Sanctum API, payments, storage, and admin surface
- Flutter remains the Android/iOS application

## Run locally

```powershell
cd advaita-matrimony-next
npm install
npm run dev
```

Open `http://localhost:3000`.

The canonical website routes are:

- `/` — public homepage
- `/login` — real phone, OTP and password sign-in
- `/register` — real registration wizard
- `/dashboard` — authenticated member dashboard
- `/discover`, `/search`, `/matches`, `/interests`, `/shortlisted`, `/viewers` — member discovery and connections
- `/messages`, `/notifications`, `/subscription`, `/profile`, `/settings`, `/help` — member account surfaces
- `/terms`, `/privacy`, `/refund` — legal pages

## Dashboard route and clean builds

The member dashboard intentionally uses a route group:

```text
app/(member)/dashboard/page.tsx  →  /dashboard
```

There must not be a second `app/dashboard/page.tsx`. Route groups do not appear in the URL, so both files would resolve to `/dashboard` and Next.js will stop the build with a duplicate-route error. If a local Next process still reports `./app/dashboard`, stop it, remove the generated `.next` directory, and restart from the current `main` branch:

```bash
rm -rf .next
npm run dev
```

Legacy `/login.html` and `/register.html` URLs redirect to the new routes. The hero video is read from the tracked `frontend-preview/media/advaithamatrimony.mp4` file through `/api/media/advaithamatrimony.mp4`. The media route supports starting the app from either the repository root or `advaita-matrimony-next`; for a separate deployment, set `ADVAITA_MEDIA_DIR` to the directory containing the tracked media files. Keep the repository layout intact when running the Next app locally.

Copy `.env.example` to `.env.local` when API integration is enabled. The frontend uses the Laravel API through the Next BFF and stores the session in an httpOnly cookie.

## Local preview login

For a local UI review only, copy `.env.example` to `.env.local` and set:

```text
NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN=true
NEXT_PUBLIC_PREVIEW_LOGIN_EMAIL=preview@advaita.test
NEXT_PUBLIC_PREVIEW_LOGIN_PASSWORD=Advaita2026!
```

The login page shows a clearly labelled preview shortcut only when `NODE_ENV` is not `production`. It still calls the real Laravel password-login endpoint; it is not a frontend bypass. Create the account through the Laravel local/testing seed:

```powershell
cd ..\advaita-matrimony-web
php artisan migrate:fresh --seed
```

Then open `/login` and choose **Use preview credentials**. The seed is guarded to `local` and `testing` environments and must never be used as a production account.

The public homepage uses the tracked `/media/hero-poster.svg` poster and `/api/media/advaithamatrimony.mp4` video when the media route is available. It remains public and does not require a session.
