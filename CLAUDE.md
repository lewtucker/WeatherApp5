# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeatherApp5 is a simple web application that allows users to find weather information for a city along with points of interest (restaurants, parks, shopping, hotels). Uses imperial units (°F, mph).

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS via CDN), vanilla JavaScript
- **Weather Data**: OpenWeatherMap API (weather + geocoding)
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Points of Interest**: OpenStreetMap Overpass API

## Architecture

Single-page application with no build step:

- `index.html` - Main page with UI components and city selection modal
- `app.js` - All application logic (weather fetching, map control, POI search)
- `config.js` - API key storage (gitignored)

## Key Functions in app.js

- `handleSearch()` - Uses geocoding API, shows city selection modal if multiple matches
- `getWeatherByCoords(lat, lon, cityName, country, state)` - Fetches weather by coordinates
- `showCityOptions(cities)` / `selectCity(index)` - City disambiguation modal
- `searchPOI(type)` - Queries Overpass API for nearby places
- `displayPOI(places, type)` - Renders color-coded POI cards
- `updateMap(lat, lon)` - Centers Leaflet map and adds markers
- `getUserLocation()` - Browser geolocation with reverse geocoding

## Development

```bash
python -m http.server 8000
# or
npx serve
```

## API Configuration

The app expects `config.js` with:

```javascript
const CONFIG = {
    OPENWEATHERMAP_API_KEY: 'your_key_here'
};
```
