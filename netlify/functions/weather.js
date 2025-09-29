const fetch = require('node-fetch');

// Helper to get coordinates from city name using Open-Meteo geocoding
async function getCoordinates(city) {
    const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = await resp.json();
    if (!data.results || !data.results[0]) throw new Error("City not found");
    return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
}

// Helper to get historical temperatures for a specific date over the maximum possible range
async function getHistoricalTemps(lat, lon, month, day) {
    const endYear = new Date().getFullYear() - 1; // last complete year
    const startYear = 1940; // Try from 1940, as some datasets go back this far
    const temps = [];
    for(let year = startYear; year <= endYear; year++) {
        const date = `${year}-${month}-${day}`;
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_mean&timezone=auto`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.daily && data.daily.temperature_2m_mean && data.daily.temperature_2m_mean[0] != null) {
            temps.push({year, temp: data.daily.temperature_2m_mean[0]});
        }
    }
    return temps;
}

exports.handler = async function(event) {
    try {
        const params = event.queryStringParameters || {};
        const city = params.city || "London";
        let month = params.month, day = params.day;
        if (!month || !day) {
            const today = new Date();
            month = String(today.getMonth() + 1).padStart(2, "0");
            day = String(today.getDate()).padStart(2, "0");
        }

        // Get city coordinates
        const { lat, lon, name } = await getCoordinates(city);

        // Get historical temperatures for this day across all available years
        const temps = await getHistoricalTemps(lat, lon, month, day);

        // Find the oldest year with data
        const oldest = temps.length > 0 ? temps[0].year : null;

        return {
            statusCode: 200,
            body: JSON.stringify({
                city: name,
                temps: temps.map(e => e.temp),
                years: temps.map(e => e.year),
                oldest,
                label: `Average temperature on ${month}-${day} for all available years`
            })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message || "Failed to fetch historical temperature data" })
        };
    }
};