// WeatherApp - Main Application

// State
let map = null;
let currentCoords = null;
let focusedPOI = null;
let poiMarkers = [];

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherSection = document.getElementById('weatherSection');
const poiResults = document.getElementById('poiResults');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupEventListeners();
    getUserLocation();
});

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([40.7128, -74.0060], 12); // Default to NYC

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    locationBtn.addEventListener('click', getUserLocation);

    // POI buttons
    document.querySelectorAll('.poi-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentCoords) {
                searchPOI(btn.dataset.poi);
                // Highlight active button
                document.querySelectorAll('.poi-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-2'));
                btn.classList.add('ring-2', 'ring-offset-2');
            } else {
                alert('Please search for a city first');
            }
        });
    });

    // City selection modal cancel button
    document.getElementById('cancelCitySelect').addEventListener('click', closeCityModal);
}

// Get user's current location
function getUserLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return;
    }

    locationBtn.disabled = true;
    locationBtn.innerHTML = '<svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            currentCoords = { lat: latitude, lon: longitude };

            // Reverse geocode to get city name
            try {
                const response = await fetch(
                    `/api/geo/reverse?lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                if (data.length > 0) {
                    cityInput.value = data[0].name;
                    await getWeatherByCoords(latitude, longitude, data[0].name, data[0].country, data[0].state);
                }
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
            }

            resetLocationButton();
        },
        (error) => {
            console.error('Geolocation error:', error);
            resetLocationButton();
        }
    );
}

function resetLocationButton() {
    locationBtn.disabled = false;
    locationBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
}

// Handle city search
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    try {
        // Use Geocoding API to find matching cities
        const geoUrl = `/api/geo/direct?q=${encodeURIComponent(city)}&limit=5`;
        const geoResponse = await fetch(geoUrl);
        const cities = await geoResponse.json();

        if (!cities || cities.length === 0) {
            alert('City not found. Please try again.');
        } else if (cities.length === 1) {
            // Only one result, use it directly
            await getWeatherByCoords(cities[0].lat, cities[0].lon, cities[0].name, cities[0].country, cities[0].state);
        } else {
            // Multiple results, show selection modal
            showCityOptions(cities);
        }
    } catch (error) {
        alert('Search failed. Please try again.');
    }

    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
}

// Show city selection modal
function showCityOptions(cities) {
    const modal = document.getElementById('cityModal');
    const optionsContainer = document.getElementById('cityOptions');

    let html = '';
    cities.forEach((city, index) => {
        const location = [city.name, city.state, city.country].filter(Boolean).join(', ');
        html += `
            <button class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                    onclick="selectCity(${index})">
                <span class="font-medium text-gray-800">${escapeHtml(location)}</span>
            </button>
        `;
    });

    optionsContainer.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Store cities for selection
    window.pendingCities = cities;
}

// Handle city selection from modal
async function selectCity(index) {
    const city = window.pendingCities[index];
    closeCityModal();

    searchBtn.disabled = true;
    searchBtn.textContent = 'Loading...';

    try {
        await getWeatherByCoords(city.lat, city.lon, city.name, city.country, city.state);
        cityInput.value = city.name;
    } catch (error) {
        alert('Failed to get weather data.');
    }

    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
}

// Close city selection modal
function closeCityModal() {
    const modal = document.getElementById('cityModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    window.pendingCities = null;
}

// Fetch weather data by coordinates
async function getWeatherByCoords(lat, lon, cityName, country, state) {
    const url = `/api/weather?lat=${lat}&lon=${lon}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }

    const data = await response.json();
    // Use the provided city info for better display (includes state)
    const locationName = state ? `${cityName}, ${state}, ${country}` : `${cityName}, ${country}`;
    displayWeather(data, locationName);

    currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
    updateMap(data.coord.lat, data.coord.lon);
    clearPOIResults();
}

// Display weather data
function displayWeather(data, locationName) {
    document.getElementById('cityName').textContent = locationName || `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°F`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind').textContent = data.wind.speed;
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);

    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weatherIcon').alt = data.weather[0].description;

    weatherSection.classList.remove('hidden');
}

// Update map position
function updateMap(lat, lon) {
    map.setView([lat, lon], 13);

    // Clear existing markers except POI markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker && !poiMarkers.includes(layer)) {
            map.removeLayer(layer);
        }
    });

    // Add city marker
    L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${cityInput.value}</b>`)
        .openPopup();
}

// Search for Points of Interest using Overpass API
async function searchPOI(type) {
    if (!currentCoords) return;

    // Show loading state
    poiResults.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Searching for places...</p>';

    // Map POI types to Overpass queries
    const poiQueries = {
        restaurant: '["amenity"="restaurant"]',
        park: '["leisure"="park"]',
        shop: '["shop"]',
        hotel: '["tourism"="hotel"]'
    };

    const query = poiQueries[type] || poiQueries.restaurant;
    const radius = 2000; // 2km radius

    const overpassQuery = `
        [out:json][timeout:25];
        (
            node${query}(around:${radius},${currentCoords.lat},${currentCoords.lon});
            way${query}(around:${radius},${currentCoords.lat},${currentCoords.lon});
        );
        out center 20;
    `;

    // Retry logic - attempt up to 3 times
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                poiResults.innerHTML = `<p class="text-gray-500 col-span-full text-center py-8">Searching for places... (retry ${attempt}/${maxRetries})</p>`;
            }

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            displayPOI(data.elements, type);
            return; // Success, exit the function
        } catch (error) {
            console.error(`POI search attempt ${attempt} failed:`, error);
            lastError = error;

            // Wait before retrying (1 second delay)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // All retries failed
    console.error('POI search failed after all retries:', lastError);
    poiResults.innerHTML = '<p class="text-red-500 col-span-full text-center py-8">Failed to load places. Please try again.</p>';
}

// Display POI results
function displayPOI(places, type) {
    // Clear existing POI markers
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers = [];

    if (!places || places.length === 0) {
        poiResults.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No places found in this area</p>';
        return;
    }

    // Type icons and colors
    const typeConfig = {
        restaurant: { emoji: '🍽️', bg: 'bg-orange-50', border: 'border-orange-400' },
        park: { emoji: '🌳', bg: 'bg-green-50', border: 'border-green-400' },
        shop: { emoji: '🛍️', bg: 'bg-purple-50', border: 'border-purple-400' },
        hotel: { emoji: '🏨', bg: 'bg-blue-50', border: 'border-blue-400' }
    };

    const config = typeConfig[type] || typeConfig.restaurant;

    // Build results HTML
    let html = '';
    places.forEach(place => {
        const name = place.tags?.name || 'Unnamed';
        const lat = place.lat || place.center?.lat;
        const lon = place.lon || place.center?.lon;

        if (!lat || !lon) return;

        // Add card
        html += `
            <div class="${config.bg} border-2 ${config.border} rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer" onclick="focusOnPOI(${lat}, ${lon})">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${config.emoji}</span>
                    <div>
                        <h3 class="font-semibold text-gray-800">${escapeHtml(name)}</h3>
                        ${place.tags?.cuisine ? `<p class="text-sm text-gray-600">${escapeHtml(place.tags.cuisine)}</p>` : ''}
                        ${place.tags?.['addr:street'] ? `<p class="text-sm text-gray-500">${escapeHtml(place.tags['addr:street'])}</p>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Add marker to map
        const marker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${escapeHtml(name)}</b>`);
        poiMarkers.push(marker);
    });

    poiResults.innerHTML = html || '<p class="text-gray-500 col-span-full text-center py-8">No places found</p>';
}

// Focus on a specific POI
function focusOnPOI(lat, lon) {
    map.setView([lat, lon], 16);
    // Store focused POI for Google Maps
    focusedPOI = { lat, lon };
    // Find and open the popup for this marker
    poiMarkers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lon) < 0.0001) {
            marker.openPopup();
        }
    });
}

// Clear POI results
function clearPOIResults() {
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers = [];
    focusedPOI = null;
    poiResults.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Select a category above to find points of interest</p>';
    document.querySelectorAll('.poi-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-2'));
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open current location in Google Maps
function openInGoogleMaps() {
    if (!currentCoords) {
        alert('Please search for a city first');
        return;
    }
    // Use focused POI if available, otherwise use city coordinates
    const coords = focusedPOI || currentCoords;
    const zoom = focusedPOI ? 17 : 13;
    const url = `https://www.google.com/maps/@${coords.lat},${coords.lon},${zoom}z`;
    window.open(url, '_blank');
}
