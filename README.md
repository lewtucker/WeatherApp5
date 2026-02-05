# WeatherApp

A simple web application to find weather information and points of interest for any city.

## Features

- **City Search**: Search for weather by city name with disambiguation for cities in multiple states/countries
- **Geolocation**: Automatically detect your current location
- **Current Weather**: Temperature (°F), humidity, wind speed (mph), and conditions
- **Interactive Map**: OpenStreetMap-powered map with markers
- **Points of Interest**: Find nearby restaurants, parks, shopping, and hotels with color-coded cards
- **Secure API Key**: Backend proxy keeps your API key hidden from browsers

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/WeatherApp5.git
   cd WeatherApp5
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API key**

   Set the API key as an environment variable (recommended):

   ```bash
   export OPENWEATHERMAP_API_KEY='your_api_key_here'
   ```

   Or edit `server.js` directly (not recommended for production).

   Get a free API key at [OpenWeatherMap](https://openweathermap.org/api).

4. **Start the server**

   ```bash
   npm start
   ```

5. **Open in browser**

   Navigate to `http://localhost:3000`

## Tech Stack

- HTML5 / CSS3 / JavaScript (frontend)
- Node.js / Express (backend proxy)
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Leaflet.js](https://leafletjs.com/) - Interactive maps
- [OpenWeatherMap API](https://openweathermap.org/) - Weather data and geocoding
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [Overpass API](https://overpass-api.de/) - Points of interest data

## Project Structure

```text
WeatherApp5/
├── index.html      # Main HTML page with city selection modal
├── app.js          # Frontend application logic
├── server.js       # Backend proxy server (holds API key)
├── package.json    # Node.js dependencies
├── .gitignore      # Git ignore file
├── CLAUDE.md       # Claude Code guidance
└── README.md       # This file
```

## API Security

The OpenWeatherMap API key is stored on the server side in `server.js`. The frontend makes requests to local proxy endpoints (`/api/weather`, `/api/geo/direct`, `/api/geo/reverse`) which forward requests to OpenWeatherMap with the API key attached server-side.

## License

MIT
