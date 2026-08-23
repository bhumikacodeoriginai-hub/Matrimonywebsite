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
- `/login` — styled login surface
- `/register` — styled registration surface
- `/terms`, `/privacy`, `/refund` — legal placeholders ready for final Laravel policy content

Legacy `/login.html` and `/register.html` URLs redirect to the new routes. The hero video is read from the tracked `frontend-preview/media/advaithamatrimony.mp4` file through `/api/media/advaithamatrimony.mp4`; keep the repository layout intact when running the Next app locally.

Copy `.env.example` to `.env.local` when API integration is enabled. The auth forms are currently visual and do not submit user data to Laravel yet; the existing Flutter and Laravel business logic remain untouched.
