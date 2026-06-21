# Carbon Tracker — Your Personal Carbon Ledger

> Built for the **Hack2skill x Google** hackathon
> **Problem Statement:** Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

## The Idea

Most carbon trackers ask people to log emissions and then dump a generic checklist of "10 tips to save the planet" on them — advice that has nothing to do with what the person actually did that week.

**Carbon Tracker treats your emissions like a financial ledger.** You log daily transport, energy, and food activity the way you'd log expenses. The app calculates your real CO2 cost per entry, shows it on a passbook-style dashboard, and then — instead of generic tips — uses **Gemini AI** to read your actual week of data and tell you the *one specific swap* that would cut the most emissions, based on what you personally logged.

It's not "reduce car usage." It's *"You logged 3 short trips under 2km by car this week — switching those to walking saves ~X kg CO2."*

## Features

- 🔐 **Google Sign-In** — quick, secure auth via Firebase
- 📒 **Ledger-style logging** — log transport, energy, and food activity in seconds
- 📊 **Live dashboard** — weekly CO2 total, category breakdown (pie chart), daily trend (line chart)
- 🏷️ **Benchmark stamp** — see how your footprint compares to the national daily average at a glance
- ✨ **Gemini-powered personalized insights** — AI analyzes your actual logged data and suggests one concrete, specific action — not generic eco-advice
- ☁️ **Realtime sync** — Firestore keeps your data live across sessions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Custom CSS (ledger/passbook design system) |
| Auth | Firebase Authentication (Google provider) |
| Database | Firebase Firestore |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Charts | Recharts |
| Icons | Lucide React |

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React UI   │ <──> │  Firebase Auth    │      │  Firestore  │
│  (Vite app)  │      │  (Google OAuth)   │ <──> │  (logs DB)  │
└──────┬───────┘      └──────────────────┘      └─────────────┘
       │
       │  weekly log summary (JSON)
       ▼
┌──────────────────┐
│   Gemini API      │
│ (personalized     │
│  insight engine)   │
└──────────────────┘
```

**Data flow:**
1. User logs an activity (e.g. "Car, 10km") → app calculates CO2 using emission factors → written to Firestore
2. Dashboard subscribes to Firestore in real time → aggregates into category/daily breakdowns
3. On request, the week's logs are summarized and sent to Gemini, which returns a specific, numbers-based insight and suggestion

## Carbon Calculation Methodology

Emission factors are India-calibrated averages (grid emission factor ~0.82 kgCO2/kWh per CEA estimates, transport/diet LCA averages). Full factor table in [`src/utils/carbonCalc.js`](src/utils/carbonCalc.js). This is a personal-tracking estimate, not a certified carbon accounting tool — accuracy is intentionally traded for simplicity and speed of logging.

## Getting Started

### Prerequisites
- Node.js (LTS, v18+)
- A Firebase project (Authentication + Firestore enabled)
- A Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Setup

```bash
git clone <your-repo-url>
cd carbon-tracker
npm install
```

Create a `.env` file in the root (use `.env.example` as a template):

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

**Firestore index note:** the app queries logs filtered by user and sorted by date, which requires a Firestore composite index (`logs` collection: `uid` Ascending, `createdAt` Descending). Firestore will prompt you to create this automatically the first time the query runs — just follow the link in the console, or create it manually under Firestore → Indexes.

## Project Structure

```
src/
├── components/      # Login, LogForm, Dashboard, InsightCard
├── firebase/         # Firebase config + Firestore data layer
├── hooks/            # useAuth hook
├── utils/             # carbonCalc.js, geminiInsights.js
└── App.jsx
```

## Future Scope

- Push notifications / weekly digest emails
- Social leaderboard among friends or teams
- Receipt/bill photo scanning (OCR) to auto-log energy usage
- Carbon offset marketplace integration
- Expanded emission factor database by region/country

## Team

Built by Siddharth Darjee for the Hack2skill x Google hackathon (June 2026).

