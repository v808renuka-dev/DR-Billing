# DR Billing – Deshpande Ropes Shop Management & Billing

Angular 19 + Node.js/Express + MySQL.

## Setup
1. Install MySQL and edit `backend/.env` (DB user/password, JWT secret).
2. Backend:
   ```
   cd backend
   npm install
   npm run init-db     # creates DB, 6 tables, admin user, sample data
   npm start           # http://localhost:3001
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   npm start -- --port 4300   # http://localhost:4300
   ```
4. Login: `admin` / `admin123` (change in `backend/.env` before running `init-db`).

## Tables
Users, ShopDetails, ProductCategories, Products, Bills, BillItems (see `backend/sql/schema.sql`).

## Notes
- Shop name, app name, address, contact details and logo are editable under **Shop Settings**; they appear on the login screen, sidebar, browser title, invoices and reports.
- The API URL is set in `frontend/src/app/core/api.service.ts` (`BASE`).
