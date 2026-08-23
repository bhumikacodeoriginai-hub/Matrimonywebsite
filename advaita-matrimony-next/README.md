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
- `/login` — preview access login
- `/register` — styled registration surface
- `/dashboard` — bilingual demo dashboard
- `/terms`, `/privacy`, `/refund` — legal placeholders ready for final Laravel policy content

### Preview dashboard login

Use only for local design preview:

```text
Username: demo@advaita.test
Password: Advaita2026!
```

These credentials are hardcoded preview credentials and do not connect to production authentication or the Laravel database.

Legacy `/login.html` and `/register.html` URLs redirect to the new routes. The hero video is read from the tracked `frontend-preview/media/advaithamatrimony.mp4` file through `/api/media/advaithamatrimony.mp4`. The media route supports starting the app from either the repository root or `advaita-matrimony-next`; for a separate deployment, set `ADVAITA_MEDIA_DIR` to the directory containing the tracked media files. Keep the repository layout intact when running the Next app locally.

Copy `.env.example` to `.env.local` when API integration is enabled. The auth forms are currently visual and do not submit user data to Laravel yet; the existing Flutter and Laravel business logic remain untouched.
