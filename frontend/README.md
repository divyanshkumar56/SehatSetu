# SehatSetu — SIH 2026 Prototype

This repository contains the frontend prototype for **SehatSetu**, a closed-loop referral management system designed for rural and underserved healthcare in India.

This is a **frontend-only demonstration** built for the SIH presentation. It uses `localStorage` to simulate a shared backend database, allowing you to test the complete workflow end-to-end directly in the browser.

## Features Built

- **Shared State Management:** All pages use a shared Context API store backed by `localStorage`. Changes in one view immediately reflect everywhere else.
- **Role Switching:** A dropdown in the sidebar allows you to quickly switch between ASHA Worker, Receiving Facility, and Admin views.
- **Referral Creation:** A multi-step form to collect patient details, clinical context, and recommend nearby facilities using offline Haversine distance calculations.
- **Referral Tracking:** A detailed view showing the referral's lifecycle, with actionable buttons to advance the status (e.g., Accept, Schedule Appointment, Mark Arrived).
- **Patient QR Portal:** A mobile-friendly read-only view for patients to track their referral status. Accessible via QR code generated upon referral creation.
- **Stalled Referral Simulation:** A demo button to instantly detect and flag "stalled" referrals (simulating an automated cron job).
- **Analytics Dashboard:** Real-time charts built with Recharts, visualizing referral statuses, urgency distributions, facility workloads, and more.
- **Facility Directory:** A searchable and filterable directory of healthcare facilities.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM v7
- Lucide React (Icons)
- Recharts (Analytics)
- qrcode.react (QR Codes)

## Local Setup

To run this prototype locally on your machine:

1. Ensure you have Node.js installed.
2. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`.

> **Note:** On first load, the app will automatically populate seed data (facilities and sample referrals) into your browser's local storage.

## Deployment to Vercel / Netlify

This project is configured for easy static deployment. Since it relies solely on `localStorage`, it can be hosted anywhere without a backend server.

### Vercel Deployment
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Import this repository.
3. Set the Root Directory to `frontend`.
4. Leave the default Build Settings (`npm run build` and `dist` output directory).
5. Click **Deploy**.
*(A `vercel.json` file is already included to handle React Router client-side routing).*

### Netlify Deployment
1. Go to [Netlify](https://www.netlify.com/) and add a new site.
2. Import this repository.
3. Set the Base directory to `frontend`.
4. Set Build command to `npm run build`.
5. Set Publish directory to `frontend/dist`.
6. Click **Deploy Site**.
*(A `public/_redirects` file is already included to handle React Router client-side routing).*

## Demo Reset
If you want to return the application to its original state (e.g., for a fresh demo presentation), click the **Reset Demo Data** button located at the bottom of the sidebar.
