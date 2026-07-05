# 🚌 GödBusz

GödBusz is a real-time bus tracking and routing application designed to provide live updates, schedules, and route information for buses in the city of Göd.

The application builds on the backend of the Molteam Göd bus application with the goal of dramatically improving the user interface, experience (UX), and layout.

🔗 **Original application:** [https://god.molteam.hu/](https://god.molteam.hu/)

---

## 🤖 AI Assisted Development

This project started as an experiment in AI-assisted coding:
1. **Initial Phase**: Built primarily using `gemma4:31b`.
2. **Refactoring & Optimization**: `Claude Opus 4.6/Gemini 3.5` was used to clean up code structures and provide architectural improvement suggestions.
3. **Advanced Enhancements & Modularization**: Refactored, modularized, and optimized using **Antigravity** (an agentic AI coding assistant designed by Google DeepMind). This phase focused on component modularity, strict state synchronization, security sanitization, and the introduction of advanced routing and filtering features.

📝 [Medium article detailing the process](https://medium.com/p/aa5b7a4178de)

---

## ✨ Features

- **Real-time Tracking**: Live GPS-based positions of active buses updating dynamically on an interactive map.
- **Route Selection & Visualizations**: Detailed rendering of bus routes and paths.
- **Stop Locator**: Interactive bus stop markers containing route details and physical locations.
- **Sibling Stop & Multi-Route Navigation**: Stops with matching names are grouped, letting users navigate between different routes served by the same stop using interactive pills in the stop popup.
- **Timetable & Date Filtering**: Search and view bus schedules for specific dates, supporting date-based timetable queries.
- **Favorites Management**: Save frequently used bus stops to a favorites list, synchronized seamlessly across search components and map overlays via a custom `useFavorites` hook.
- **Intelligent Routing**: Integrated OSRM-powered route proxy caching calls to provide efficient pathfinding between stops.
- **Interactive Map**: Built with React-Leaflet with support for persistent map coordinates and zoom states.
- **Cookie Consent & Google Tag Manager (GTM)**: Privacy-compliant cookie banner that initializes GTM analytics tracking only upon user consent.
- **Security & XSS Mitigation**: Secure stop popup content rendering using DOMPurify sanitization.

---

## 🎨 Design & Aesthetics

The application layout, color tokens, and styling follow the clean, modern design language of the **BudapestGO** web application. 

- **Styling**: Powered by Tailwind CSS v4 custom properties configured inside the `@theme` definitions of `index.css`.
- **Icons**: Clean, modern custom SVG vector markers for stops and active buses.

---

## 🗺️ Map Data & Tiles

While the original Molteam application relies on default OpenStreetMap tiles, GödBusz features a custom-styled city map. 
* The deployed map tiles were created with **Maperitive** from OpenStreetMap data, applying custom styles tailored to Göd.
* For local development, or if you prefer the default tiles, you can swap the tile provider inside the React map components.
* Neighboring areas beyond Göd fallback gracefully to standard OSM tiles.

---

## 📂 Project Structure

Both the frontend and backend architectures have been refactored into a highly modular, decoupled structure:

```text
GödBusz/
├── client/                      # Frontend application (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── api/                 # API client interfaces (communicates with Express server)
│   │   ├── components/          # Reusable UI & Map components
│   │   │   ├── map/             # MapView, StopMarker, BusMarker, RoutingMachine, etc.
│   │   │   └── ui/              # Header, CookieBanner, Timetable, Pill, Plate, PopupModal
│   │   ├── hooks/               # Custom React hooks (useFavorites, useBuses, useStop, etc.)
│   │   ├── lib/                 # Shared utilities (normalize helper, date utils, constants, GTM)
│   │   ├── pages/               # StopPage and client-side routes
│   │   ├── types/               # TypeScript type declarations
│   │   ├── App.tsx              # Main App orchestrator and routing layout
│   │   ├── index.css            # Stylesheets using Tailwind v4 theme definitions
│   │   └── main.tsx             # React DOM entry point
│   ├── Dockerfile               # Client container configuration
│   └── vercel.json              # Configures rewrites for client-side routing on Vercel
│
├── server/                      # Backend API (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── analytics/           # SQLite database services for tracking API usage stats
│   │   ├── middleware/          # Cache, asyncHandler, errorHandler, and requestAnalytics
│   │   ├── routes/              # Express API endpoints (api.js, admin.js)
│   │   ├── services/            # external API service integration (Molteam wrapper)
│   │   ├── helper.js            # Server-side parsing, parsing-helper, and transformations
│   │   └── index.js             # Express application server entry point
│   └── Dockerfile               # Server container configuration
│
├── build-client.sh              # Script to build client Docker image
└── build-serve.sh               # Script to build server Docker image
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/)
- Docker (Optional, for containerized deployments)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bacce/GodBusz.git
   cd godbusz
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The backend server will start on `http://localhost:3000`.

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   The frontend client will start on `http://localhost:5173`.

---

## 🐳 Deployment

The project is containerized using Docker. You can build and run the services using the provided Dockerfiles in the `client` and `server` directories.

Root helper scripts are available for quick container building:
* `./build-client.sh`
* `./build-serve.sh`

Frontend deployment is optimized for Vercel, supporting full SPA client-side routing via custom configuration (`vercel.json`).

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## 🤝 Contribution

Any contribution is welcome! Please ensure pull requests are clean, well-formatted, and do not contain generic or unverified code suggestions. Feel free to submit PRs and issues.
