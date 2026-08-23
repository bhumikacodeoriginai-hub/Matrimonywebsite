# Advaita Matrimony Web

Modern Next.js public website foundation for Advaita Matrimony.

## Stack

- Next.js + React + TypeScript
- CSS design system with responsive layouts and reduced-motion support
- Laravel remains the backend, database, Sanctum API, payments, storage, and admin surface
- Flutter remains the Android/iOS application

## Run locally

```powershell
cd advaita-matrimony-next
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local` when API integration is enabled. The current homepage is a polished visual foundation; its buttons and preview content are intentionally not connected to the Laravel API yet.
