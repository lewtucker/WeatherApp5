# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeatherApp5 is a web application that allows users to find weather information for a city along with points of interest (restaurants, parks, shopping, hotels). Uses imperial units (°F, mph).

**Live deployment:** <https://weatherapp5.vercel.app>

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS via CDN), vanilla JavaScript
- **Backend**: Node.js/Express proxy server
- **Weather Data**: OpenWeatherMap API (weather + geocoding)
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Points of Interest**: OpenStreetMap Overpass API
- **Hosting**: Vercel (serverless)

## Architecture

Single-page application with backend proxy for API security:

- `index.html` - Main page with UI components and city selection modal
- `app.js` - Frontend application logic (weather fetching, map control, POI search)
- `server.js` - Backend proxy server (secures API key)
- `vercel.json` - Vercel deployment configuration

## Key Functions in app.js

- `handleSearch()` - Uses geocoding API, shows city selection modal if multiple matches
- `getWeatherByCoords(lat, lon, cityName, country, state)` - Fetches weather by coordinates
- `showCityOptions(cities)` / `selectCity(index)` - City disambiguation modal
- `searchPOI(type)` - Queries Overpass API for nearby places (with retry logic)
- `displayPOI(places, type)` - Renders color-coded POI cards
- `focusOnPOI(lat, lon, name)` - Zooms map to selected POI
- `openInGoogleMaps()` - Opens current location/POI in Google Maps
- `updateMap(lat, lon)` - Centers Leaflet map and adds markers
- `getUserLocation()` - Browser geolocation with reverse geocoding

## API Endpoints (server.js)

- `GET /api/weather?lat=&lon=` - Proxy for weather data
- `GET /api/geo/direct?q=&limit=` - Proxy for city search (geocoding)
- `GET /api/geo/reverse?lat=&lon=` - Proxy for reverse geocoding

## Local Development

```bash
# Set environment variable
export OPENWEATHERMAP_API_KEY='your_key_here'

# Install dependencies
npm install

# Run server
npm start
```

Server runs at <http://localhost:3000>

## Deployment (Vercel)

The app is deployed on Vercel. Environment variable `OPENWEATHERMAP_API_KEY` must be set in Vercel project settings.

```bash
npx vercel --prod
```

## Project Structure

```text
WeatherApp5/
|-- index.html      # Main page with UI and city selection modal
|-- app.js          # Frontend application logic
|-- server.js       # Backend proxy server (holds API key)
|-- vercel.json     # Vercel deployment configuration
|-- package.json    # Node.js dependencies
|-- .env.example    # Environment variable template
|-- .gitignore      # Git ignore rules
|-- CLAUDE.md       # This file
|-- README.md       # Project documentation
+-- Transcript.md   # Development session transcript
```
