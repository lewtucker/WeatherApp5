# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeatherApp5 is a single-page web application that displays weather information and nearby points of interest (restaurants, parks, shopping, hotels) for any city. All weather data uses **imperial units** (°F, mph).

**Live deployment:** <https://weatherapp5.vercel.app>

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS via CDN), vanilla JavaScript (no build step, no framework)
- **Backend**: Node.js/Express proxy server
- **Weather Data**: OpenWeatherMap API (current weather + geocoding)
- **Maps**: Leaflet.js 1.9.4 with OpenStreetMap tiles
- **Points of Interest**: OpenStreetMap Overpass API (direct client-side calls)
- **Hosting**: Vercel (serverless via `@vercel/node` for server.js, `@vercel/static` for frontend)

### External CDN Dependencies (loaded in index.html)

- Tailwind CSS: `https://cdn.tailwindcss.com`
- Leaflet CSS/JS: `https://unpkg.com/leaflet@1.9.4/`

### npm Dependencies

- `express` ^4.18.2 - HTTP server and routing
- `cors` ^2.8.5 - Cross-origin resource sharing

## Architecture

Single-page application with a backend proxy that keeps the OpenWeatherMap API key secure:

```
Browser (index.html + app.js)
  ├── /api/* requests → server.js (Express proxy) → OpenWeatherMap API
  └── POI requests → Overpass API (direct, no proxy needed)
```

- `index.html` - Main page with all UI components, city selection modal, Tailwind styling
- `app.js` - All frontend logic (weather fetching, map control, POI search, DOM manipulation)
- `server.js` - Express proxy server with 3 API endpoints; exports `app` for Vercel serverless
- `vercel.json` - Vercel deployment config (routes `/api/*` to server.js, everything else to static files)

## Key Functions in app.js

### Initialization
- `initMap()` - Creates Leaflet map centered on NYC (40.7128, -74.0060) at zoom 12
- `setupEventListeners()` - Wires up search, location, POI buttons, and modal cancel
- `getUserLocation()` - Browser geolocation with reverse geocoding to auto-detect city

### Search Flow
- `handleSearch()` - Geocodes city input via `/api/geo/direct`, shows modal if multiple matches
- `showCityOptions(cities)` - Renders city disambiguation modal (stores choices in `window.pendingCities`)
- `selectCity(index)` - Handles user selection from modal, fetches weather
- `closeCityModal()` - Hides the modal and clears pending cities

### Weather Display
- `getWeatherByCoords(lat, lon, cityName, country, state)` - Fetches weather via proxy, updates display and map
- `displayWeather(data, locationName)` - Renders temperature, humidity, wind, feels-like, and weather icon

### Map
- `updateMap(lat, lon)` - Centers map at zoom 13, clears non-POI markers, adds city marker with popup

### Points of Interest
- `searchPOI(type)` - Queries Overpass API within 2km radius; supports types: `restaurant`, `park`, `shop`, `hotel`; retries up to 3 times with 1s delay
- `displayPOI(places, type)` - Renders color-coded cards and adds markers to map
- `focusOnPOI(lat, lon)` - Zooms map to zoom 16 on a specific POI, opens its popup
- `clearPOIResults()` - Removes all POI markers and resets the results panel

### Utilities
- `escapeHtml(text)` - XSS protection using DOM textContent/innerHTML pattern
- `openInGoogleMaps()` - Opens focused POI or city coordinates in Google Maps (new tab)
- `resetLocationButton()` - Restores location button icon after geolocation completes

## State Management

Global variables in app.js (no framework state management):
- `map` - Leaflet map instance
- `currentCoords` - `{ lat, lon }` of the current city
- `focusedPOI` - `{ lat, lon }` of the currently focused POI (used by Google Maps link)
- `poiMarkers` - Array of Leaflet markers for current POI results

## API Endpoints (server.js)

All endpoints proxy to OpenWeatherMap, appending the server-side API key:

| Endpoint | Proxies To | Parameters |
|---|---|---|
| `GET /api/weather` | `api.openweathermap.org/data/2.5/weather` | `lat`, `lon` (required) |
| `GET /api/geo/direct` | `api.openweathermap.org/geo/1.0/direct` | `q` (required), `limit` (default 5) |
| `GET /api/geo/reverse` | `api.openweathermap.org/geo/1.0/reverse` | `lat`, `lon` (required), `limit` (default 1) |

The server validates required parameters and returns 400 for missing ones, 500 for upstream failures.

## Local Development

```bash
# Set environment variable (required - server exits if missing)
export OPENWEATHERMAP_API_KEY='your_key_here'

# Install dependencies
npm install

# Run server (also serves static files)
npm start
```

Server runs at <http://localhost:3000>. The `npm start` and `npm run dev` scripts both run `node server.js`. Static files are served from the project root directory.

**Note:** The server requires Node.js with native `fetch` support (Node 18+), as it uses `fetch` without a polyfill.

## Deployment (Vercel)

The app is deployed on Vercel. The `OPENWEATHERMAP_API_KEY` environment variable must be set in Vercel project settings.

```bash
npx vercel --prod
```

Vercel config (`vercel.json`) routes:
- `/api/*` → `server.js` (serverless function)
- `/app.js` → `app.js` (static)
- `/*` → `index.html` (static, catch-all)

## Security Considerations

- **API key protection**: The OpenWeatherMap API key is never exposed to the client. All weather/geocoding requests go through the Express proxy.
- **XSS prevention**: User-supplied and API-returned text is escaped via `escapeHtml()` before insertion into the DOM.
- **No authentication**: The app has no user accounts or auth. The proxy endpoints are open.
- **Overpass API**: POI queries go directly from the browser to `overpass-api.de` (no API key needed).
- **CORS**: The server uses the `cors` middleware with default settings (allows all origins).

## Coding Conventions

- Vanilla JavaScript with no transpilation or build step
- All frontend code in a single `app.js` file; all HTML/CSS in `index.html`
- Tailwind CSS utility classes for all styling (via CDN, no config file)
- CommonJS `require()` in server.js (not ES modules)
- Functions use standard `function` declarations (not arrow functions) at the top level
- Async/await for all API calls
- `window.pendingCities` used for passing data between modal functions (global state)
- Inline `onclick` handlers in dynamically generated HTML for POI cards and city options

## Testing

No test framework is currently configured. There are no automated tests.

## Project Structure

```text
WeatherApp5/
├── index.html        # Main page with all UI components and city selection modal
├── app.js            # Frontend application logic (weather, map, POI, DOM)
├── server.js         # Express proxy server (API key security, 3 endpoints)
├── vercel.json       # Vercel deployment configuration (routes + builds)
├── package.json      # Node.js dependencies (express, cors)
├── package-lock.json # Dependency lock file
├── .env.example      # Environment variable template
├── .gitignore        # Git ignore rules (node_modules, .env, .vercel, etc.)
├── CLAUDE.md         # AI assistant guidance (this file)
├── README.md         # Project documentation and setup instructions
├── Todo.md           # Original project requirements / task list
└── Transcript.md     # Development session transcript
```
