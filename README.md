# CRYSIS OS

City-scale emergency response platform with two coordinated interfaces: Citizen Reporting and Admin Control Room.

## Backstory

In many cities, the first few minutes of an emergency are lost because reports are scattered, incomplete, or difficult to verify. CRYSIS OS is built to compress that delay: let citizens report fast with location context, then give responders a live control room view to triage and act.

The current demo is configured for the Durgapur-Asansol region, but the core design is city-agnostic.

## Core Concept

One shared incident pipeline, two views:

- Citizen: submit incident reports with validated identity/contact and location capture.
- Admin: monitor active incidents, filter severity/status, and resolve incidents in real time.

When an incident is resolved, it automatically disappears from the active admin map.

## Key Features

- Role-based entry: `/citizen` and `/admin` routes.
- Admin access control: passkey gate before entering control room.
- Live incident lifecycle: `open -> in_progress -> resolved`.
- Map-based operations with type-specific icons (fire, flood, medical, accident, crime).
- Demo location generator inside Durgapur-Asansol bounds for judging and remote testing.
- Input hardening in citizen form:
	- Full name format (first name + surname)
	- Indian phone format (`+91` + 10-digit mobile)
- Anti-spam protection (client-side rate limiting): max 3 reports per 10 minutes.
- AI decision support layer for recommendations and nearest response units.

## Tech Stack

- Frontend: React + Vite
- UI: Tailwind CSS + custom reusable components
- Mapping: Leaflet + OpenStreetMap
- Backend: Firebase Firestore
- Intelligence: rule-based AI service (with optional OpenAI env hook)

## AI Integration

The AI module evaluates each incident and produces:

- Priority hint
- Recommended immediate actions
- Nearby unit suggestions
- Contextual alerts by incident type/risk context

This keeps admin decisions explainable while still being fast.

## Security and Reliability Notes

- Admin route is protected with a passkey check.
- Citizen reporting includes validation barriers plus rate limiting to reduce spam.
- SPA deployment routing is configured for Vercel and Netlify rewrites.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env.local` and provide real values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_PASSKEY`
- `VITE_OPENAI_API_KEY` (optional)

## Deployment

- Build: `npm run build`
- Vercel: `vercel.json` rewrite included
- Netlify: `_redirects` and `netlify.toml` included

## Hackathon Pitch Line

CRYSIS OS turns fragmented emergency reporting into one actionable, map-first control loop for faster, safer city response.
