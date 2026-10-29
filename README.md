# Oasis Globe — Sales

The sales side of Oasis Globe, kept apart from the service platform.

| Folder | What it is | Run locally |
| --- | --- | --- |
| `app/` | Sales app for salespeople (React + Capacitor → Android APK) | `cd app && npm i && npm run dev` (port 5175, `?demo=1` for sample data) |
| `backend/` | API for the app (`/api/sales`) and the dashboard (`/api/sales-admin`) | `cd backend && npm i && cp .env.example .env && npm run dev` (port 4000) |
| `dashboard/` | Owner's sales dashboard (React + Vite) | `cd dashboard && npm i && npm run dev` (port 5186, proxies `/api` to :4000) |

## Database
Uses the same Supabase project as the service platform (shared `users` table).
Run `backend/db/schema.sql` once in the Supabase SQL editor — the first line
(`alter type user_role add value 'sales'`) on its own, then the rest.

## Sign-in
- **Salespeople**: WhatsApp code on their number, in the app. Add them from the dashboard (Sales Team).
- **Owner**: dashboard, with the same password as the service dashboard, or a WhatsApp code.

Codes go out from the WhatsApp number set in `backend/.env` (`META_*`). Without it
the code is printed to the backend log.

## Deploy
- **backend** → any Node host (Render: root `backend`, start `npm start`, env from `.env.example`).
- **dashboard** → Vercel (root `dashboard`, env `VITE_API_BASE=<backend URL>`).
- **app** → `bash app/build-apk.sh <backend URL>` → `app/Oasis-Sales.apk`.
