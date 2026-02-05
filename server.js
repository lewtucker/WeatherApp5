// WeatherApp Backend Proxy Server
// Keeps the OpenWeatherMap API key secure on the server side

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Key - Must be set as environment variable
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

if (!OPENWEATHERMAP_API_KEY) {
    console.error('ERROR: OPENWEATHERMAP_API_KEY environment variable is not set');
    console.error('Set it with: export OPENWEATHERMAP_API_KEY=your_key_here');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for weather data
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon parameters required' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Proxy endpoint for geocoding (city search)
app.get('/api/geo/direct', async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'q parameter required' });
    }

    try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${OPENWEATHERMAP_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Geocoding API error:', error);
        res.status(500).json({ error: 'Failed to fetch geocoding data' });
    }
});

// Proxy endpoint for reverse geocoding (coordinates to city)
app.get('/api/geo/reverse', async (req, res) => {
    const { lat, lon, limit = 1 } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon parameters required' });
    }

    try {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${OPENWEATHERMAP_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Reverse geocoding API error:', error);
        res.status(500).json({ error: 'Failed to fetch reverse geocoding data' });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`WeatherApp server running at http://localhost:${PORT}`);
        console.log('API key is secured on the server side');
    });
}

// Export for Vercel
module.exports = app;
