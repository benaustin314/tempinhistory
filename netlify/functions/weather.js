const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const params = event.queryStringParameters || {};
    const city = params.city || 'London';

    // Use provided API key
    const apiKey = 'c79a5a3a2a023e0d24271e3b80d0549b';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            return {
                statusCode: resp.status,
                body: JSON.stringify({ error: "City not found" })
            };
        }
        const weather = await resp.json();
        // Placeholder for temperature history: in real case, fetch from a DB or another API
        const history = {
            dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            temperatures: [weather.main.temp - 2, weather.main.temp - 1, weather.main.temp, weather.main.temp - 0.5, weather.main.temp + 1]
        };
        return {
            statusCode: 200,
            body: JSON.stringify({
                city: weather.name,
                description: weather.weather[0].description,
                temperature: weather.main.temp,
                history
            })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch weather data" })
        };
    }
};